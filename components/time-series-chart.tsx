"use client"

import { useMemo } from "react"
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
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, number>()

    jobs.forEach((job) => {
      const date = new Date(job.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
    })

    const sortedData = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [year, monthNum] = month.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
        return {
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          applications: count,
        }
      })

    if (sortedData.length > 0) {
      const result = []
      const startDate = new Date(sortedData[0].month)
      const endDate = new Date()

      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const monthStr = d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        const existing = sortedData.find((item) => item.month === monthStr)
        result.push({
          month: monthStr,
          applications: existing ? existing.applications : 0,
        })
      }

      return result.slice(-12)
    }

    return sortedData
  }, [jobs])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center space-y-4">
        <div className="relative h-32 w-full">
          <svg className="h-full w-full opacity-20" viewBox="0 0 400 120">
            <path
              d="M 0 100 L 50 80 L 100 90 L 150 60 L 200 70 L 250 40 L 300 50 L 350 30 L 400 40"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="text-muted-foreground"
            />
            {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
              <circle key={x} cx={x} cy={100 - x / 10} r="3" fill="currentColor" className="text-muted-foreground" />
            ))}
          </svg>
        </div>
        <div className="flex items-center gap-2 text-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No timeline data yet</p>
            <p className="text-xs text-muted-foreground/70">Start adding applications to track trends</p>
          </div>
        </div>
      </div>
    )
  }

  const totalApplications = chartData.reduce((sum, item) => sum + item.applications, 0)
  const avgPerMonth = (totalApplications / chartData.length).toFixed(1)
  const maxMonth = chartData.reduce((max, item) => (item.applications > max.applications ? item : max), chartData[0])

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.7 0.25 220)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="oklch(0.7 0.25 220)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.02 240)" opacity={0.5} />
          <XAxis dataKey="month" stroke="oklch(0.6 0.01 240)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.6 0.01 240)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.11 0.015 240)",
              border: "1px solid oklch(0.25 0.025 240)",
              borderRadius: "0.5rem",
              color: "oklch(0.98 0.005 240)",
            }}
            labelStyle={{ color: "oklch(0.98 0.005 240)", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="applications"
            stroke="oklch(0.7 0.25 220)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorApplications)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border/50 bg-muted/10 p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{totalApplications}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-1">{avgPerMonth}</div>
          <div className="text-xs text-muted-foreground">Avg/Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-4">{chartData.length > 0 ? maxMonth.applications : 0}</div>
          <div className="text-xs text-muted-foreground">Peak</div>
        </div>
      </div>
    </div>
  )
}
