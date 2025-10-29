"use client"

import { useMemo } from "react"
import { ArrowRight, TrendingDown } from "lucide-react"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface Job {
  status: JobStatus
  created_at: string
}

interface ApplicationFunnelChartProps {
  jobs: Job[]
}

export function ApplicationFunnelChart({ jobs }: ApplicationFunnelChartProps) {
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
      <div
        className="flex h-[350px] flex-col items-center justify-center space-y-4"
        role="status"
        aria-label="No funnel data available"
      >
        <div className="relative h-32 w-full" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-24 w-48 -translate-x-1/2 rounded-t-full border-2 border-dashed border-white/40 bg-white/5" />
          <div className="absolute left-1/2 top-8 h-20 w-40 -translate-x-1/2 rounded-t-full border-2 border-dashed border-white/40 bg-white/5" />
          <div className="absolute left-1/2 top-16 h-16 w-32 -translate-x-1/2 rounded-t-full border-2 border-dashed border-white/40 bg-white/5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No data available yet</p>
          <p className="text-xs text-foreground/80">Add job applications to see your funnel</p>
        </div>
      </div>
    )
  }

  const funnelStages = [
    { name: "Wishlist", count: statusCounts.Wishlist, color: "bg-chart-3", textColor: "text-chart-3" },
    { name: "Applied", count: statusCounts.Applied, color: "bg-chart-1", textColor: "text-chart-1" },
    { name: "Interviewing", count: statusCounts.Interviewing, color: "bg-chart-4", textColor: "text-chart-4" },
    { name: "Offer", count: statusCounts.Offer, color: "bg-chart-5", textColor: "text-chart-5" },
  ]

  return (
    <div className="space-y-6" role="region" aria-label="Application funnel visualization">
      <div className="space-y-3">
        {funnelStages.map((stage, index) => {
          const percentage = total > 0 ? ((stage.count / total) * 100).toFixed(1) : "0.0"
          const prevStage = index > 0 ? funnelStages[index - 1] : null
          const conversionRate =
            prevStage && prevStage.count > 0 ? ((stage.count / prevStage.count) * 100).toFixed(0) : null

          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{stage.name}</span>
                  {conversionRate && (
                    <span
                      className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs font-medium text-white/90"
                      aria-label={`${conversionRate} percent conversion from previous stage`}
                    >
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      {conversionRate}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${stage.textColor}`} aria-label={`${stage.count} applications`}>
                    {stage.count}
                  </span>
                  <span className="text-xs text-white/80">({percentage}%)</span>
                </div>
              </div>
              <div
                className="relative h-12 overflow-hidden rounded-lg bg-secondary/30"
                role="progressbar"
                aria-valuenow={stage.count}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${stage.name}: ${stage.count} of ${total} applications`}
              >
                <div
                  className={`h-full ${stage.color} flex items-center justify-center transition-all duration-700`}
                  style={{ width: `${Math.max(Number.parseFloat(percentage), 5)}%` }}
                >
                  {stage.count > 0 && <span className="text-xs font-semibold text-background/80">{stage.count}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="grid grid-cols-3 gap-4 rounded-lg border border-border/50 bg-muted/10 p-4"
        role="region"
        aria-label="Summary statistics"
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-5" aria-label={`${statusCounts.Offer} offers received`}>
            {statusCounts.Offer}
          </div>
          <div className="text-xs text-white/80">Offers</div>
        </div>
        <div className="text-center">
          <div
            className="text-2xl font-bold text-chart-1"
            aria-label={`${statusCounts.Applied > 0 ? ((statusCounts.Offer / statusCounts.Applied) * 100).toFixed(1) : "0.0"} percent success rate`}
          >
            {statusCounts.Applied > 0 ? ((statusCounts.Offer / statusCounts.Applied) * 100).toFixed(1) : "0.0"}%
          </div>
          <div className="text-xs text-white/80">Success Rate</div>
        </div>
        <div className="text-center">
          <div
            className="flex items-center justify-center gap-1 text-2xl font-bold text-destructive"
            aria-label={`${statusCounts.Rejected} applications rejected`}
          >
            {statusCounts.Rejected}
            <TrendingDown className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="text-xs text-white/80">Rejected</div>
        </div>
      </div>
    </div>
  )
}
