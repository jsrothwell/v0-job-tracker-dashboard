"use client"

import { useMemo } from "react"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface Job {
  status: JobStatus
  created_at: string
}

interface ApplicationFunnelChartProps {
  jobs: Job[]
}

export function ApplicationFunnelChart({ jobs }: ApplicationFunnelChartProps) {
  const sankeyData = useMemo(() => {
    const statusCounts = {
      Wishlist: jobs.filter((j) => j.status === "Wishlist").length,
      Applied: jobs.filter((j) => j.status === "Applied").length,
      Interviewing: jobs.filter((j) => j.status === "Interviewing").length,
      Offer: jobs.filter((j) => j.status === "Offer").length,
      Rejected: jobs.filter((j) => j.status === "Rejected").length,
    }

    const nodes = [
      { name: "Wishlist" },
      { name: "Applied" },
      { name: "Interviewing" },
      { name: "Offer" },
      { name: "Rejected (Applied)" },
      { name: "Rejected (Interview)" },
    ]

    const links = [
      { source: 0, target: 1, value: statusCounts.Applied },
      { source: 1, target: 2, value: statusCounts.Interviewing },
      { source: 2, target: 3, value: statusCounts.Offer },
      { source: 1, target: 4, value: Math.floor(statusCounts.Rejected * 0.6) },
      { source: 2, target: 5, value: Math.floor(statusCounts.Rejected * 0.4) },
    ]

    return { nodes, links }
  }, [jobs])

  const statusCounts = useMemo(() => {
    return {
      Wishlist: jobs.filter((j) => j.status === "Wishlist").length,
      Applied: jobs.filter((j) => j.status === "Applied").length,
      Interviewing: jobs.filter((j) => j.status === "Interviewing").length,
      Offer: jobs.filter((j) => j.status === "Offer").length,
      Rejected: jobs.filter((j) => j.status === "Rejected").length,
    }
  }, [jobs])

  const total = jobs.length

  if (total === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available. Add some job applications to see your funnel.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
          const colors: Record<string, string> = {
            Wishlist: "bg-chart-3",
            Applied: "bg-chart-1",
            Interviewing: "bg-chart-4",
            Offer: "bg-chart-5",
            Rejected: "bg-destructive",
          }

          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{status}</span>
                <span className="text-muted-foreground">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full ${colors[status]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-chart-5">{statusCounts.Offer}</div>
            <div className="text-xs text-muted-foreground">Offers Received</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-chart-1">
              {statusCounts.Applied > 0 ? ((statusCounts.Offer / statusCounts.Applied) * 100).toFixed(1) : "0.0"}%
            </div>
            <div className="text-xs text-muted-foreground">Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
