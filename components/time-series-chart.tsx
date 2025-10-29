"use client"

import { useMemo, useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Calendar } from "lucide-react"

interface Job {
  created_at: string
  status: string
}

interface TimeSeriesChartProps {
  jobs: Job[]
}

export function TimeSeriesChart({ jobs }: TimeSeriesChartProps) {
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    console.log("[v0] TimeSeriesChart received jobs:", jobs.length)
    setRenderKey((prev) => prev + 1)
  }, [jobs])

  const chartData = useMemo(() => {
    console.log("[v0] Computing chart data for", jobs.length, "jobs")

    const monthlyData = new Map<string, number>()

    jobs.forEach((job) => {
      try {
        const jobDate = new Date(job.created_at)
        if (isNaN(jobDate.getTime())) {
          console.warn("[v0] Invalid date:", job.created_at)
          return
        }
        const monthKey = `${jobDate.getFullYear()}-${String(jobDate.getMonth() + 1).padStart(2, "0")}`
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
      } catch (error) {
        console.error("[v0] Error parsing date:", job.created_at, error)
      }
    })

    const sortedData = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [year, monthNum] = month.split("-")
        const dateObj = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
        return {
          month: dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          year: Number.parseInt(year),
          monthNum: Number.parseInt(monthNum) - 1,
          applications: count,
        }
      })

    if (sortedData.length > 0) {
      const result = []
      const startDate = new Date(sortedData[0].year, sortedData[0].monthNum)
      const endDate = new Date()

      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const monthStr = d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        const existing = sortedData.find((item) => item.month === monthStr)
        result.push({
          month: monthStr,
          applications: existing ? existing.applications : 0,
        })
      }

      const finalData = result.slice(-12)
      console.log("[v0] Chart data computed:", finalData.length, "months")
      return finalData
    }

    console.log("[v0] No chart data available")
    return sortedData
  }, [jobs])

  if (chartData.length === 0) {
    return (
      <div
        className="flex h-[350px] flex-col items-center justify-center space-y-4"
        role="status"
        aria-label="No timeline data available"
      >
        <div className="relative h-32 w-full" aria-hidden="true">
          <svg className="h-full w-full opacity-50" viewBox="0 0 400 120">
            <path
              d="M 0 100 L 50 80 L 100 90 L 150 60 L 200 70 L 250 40 L 300 50 L 350 30 L 400 40"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="text-foreground"
            />
            {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
              <circle key={x} cx={x} cy={100 - x / 10} r="3" fill="currentColor" className="text-foreground" />
            ))}
          </svg>
        </div>
        <div className="flex items-center gap-2 text-center">
          <Calendar className="h-4 w-4 text-foreground/90" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">No timeline data yet</p>
            <p className="text-xs text-foreground/80">Start adding applications to track trends</p>
          </div>
        </div>
      </div>
    )
  }

  const totalApplications = chartData.reduce((sum, item) => sum + item.applications, 0)
  const avgPerMonth = (totalApplications / chartData.length).toFixed(1)
  const maxMonth = chartData.reduce((max, item) => (item.applications > max.applications ? item : max), chartData[0])

  return (
    <div className="space-y-6" role="region" aria-label="Application timeline chart" key={`chart-${renderKey}`}>
      <div style={{ width: "100%", height: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            aria-label="Monthly application trend"
          >
            <defs>
              <linearGradient id={`colorApplications-${renderKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.25 220)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.7 0.25 220)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 240)" opacity={0.5} />
            <XAxis dataKey="month" stroke="oklch(0.7 0.01 240)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.7 0.01 240)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.11 0.015 240)",
                border: "1px solid oklch(0.25 0.025 240)",
                borderRadius: "0.5rem",
                color: "oklch(0.98 0 0)",
              }}
              labelStyle={{ color: "oklch(0.98 0 0)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="applications"
              stroke="oklch(0.7 0.25 220)"
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#colorApplications-${renderKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        className="grid grid-cols-3 gap-4 rounded-lg border border-border/50 bg-muted/10 p-4"
        role="region"
        aria-label="Timeline summary statistics"
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground" aria-label={`${totalApplications} total applications`}>
            {totalApplications}
          </div>
          <div className="text-xs text-foreground/80">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-1" aria-label={`${avgPerMonth} average applications per month`}>
            {avgPerMonth}
          </div>
          <div className="text-xs text-foreground/80">Avg/Month</div>
        </div>
        <div className="text-center">
          <div
            className="text-2xl font-bold text-chart-4"
            aria-label={`${chartData.length > 0 ? maxMonth.applications : 0} peak applications in a month`}
          >
            {chartData.length > 0 ? maxMonth.applications : 0}
          </div>
          <div className="text-xs text-foreground/80">Peak</div>
        </div>
      </div>
    </div>
  )
}
