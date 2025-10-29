"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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

    // Fill in missing months with 0
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

      return result.slice(-12) // Last 12 months
    }

    return sortedData
  }, [jobs])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available. Add some job applications to see your timeline.
      </div>
    )
  }

  const totalApplications = chartData.reduce((sum, item) => sum + item.applications, 0)
  const avgPerMonth = (totalApplications / chartData.length).toFixed(1)

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--popover-foreground))",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Area
            type="monotone"
            dataKey="applications"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorApplications)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 text-center">
        <div>
          <div className="text-2xl font-bold text-foreground">{totalApplications}</div>
          <div className="text-xs text-muted-foreground">Total Applications</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-chart-1">{avgPerMonth}</div>
          <div className="text-xs text-muted-foreground">Avg per Month</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-chart-4">
            {chartData.length > 0 ? chartData[chartData.length - 1].applications : 0}
          </div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
      </div>
    </div>
  )
}
