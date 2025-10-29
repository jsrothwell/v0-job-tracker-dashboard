"use client"

import { TrendingUp, Target, Clock, Award } from "lucide-react"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface Job {
  status: JobStatus
  date_applied: string | null
  created_at: string
}

interface KeyMetricsProps {
  jobs: Job[]
}

export function KeyMetrics({ jobs }: KeyMetricsProps) {
  const totalApplications = jobs.length
  const appliedJobs = jobs.filter((j) => j.status === "Applied" || j.status === "Interviewing" || j.status === "Offer")
  const interviewingJobs = jobs.filter((j) => j.status === "Interviewing" || j.status === "Offer")
  const offers = jobs.filter((j) => j.status === "Offer").length

  const interviewRate =
    appliedJobs.length > 0 ? ((interviewingJobs.length / appliedJobs.length) * 100).toFixed(1) : "0.0"

  // Calculate average response time (days between created_at and date_applied)
  const jobsWithDates = jobs.filter((j) => j.date_applied && j.created_at)
  const avgResponseTime =
    jobsWithDates.length > 0
      ? Math.round(
          jobsWithDates.reduce((sum, job) => {
            const created = new Date(job.created_at).getTime()
            const applied = new Date(job.date_applied!).getTime()
            return sum + Math.abs(applied - created) / (1000 * 60 * 60 * 24)
          }, 0) / jobsWithDates.length,
        )
      : 0

  const metrics = [
    {
      label: "Total Applications",
      value: totalApplications,
      icon: Target,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      ariaLabel: `Total applications: ${totalApplications}`,
    },
    {
      label: "Interview Rate",
      value: `${interviewRate}%`,
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      ariaLabel: `Interview rate: ${interviewRate} percent`,
    },
    {
      label: "Avg. Response Time",
      value: `${avgResponseTime}d`,
      icon: Clock,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      ariaLabel: `Average response time: ${avgResponseTime} days`,
    },
    {
      label: "Offers Received",
      value: offers,
      icon: Award,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
      ariaLabel: `Offers received: ${offers}`,
    },
  ]

  return (
    <section aria-label="Key metrics overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="glass-card group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-[1.02] focus-within:ring-2 focus-within:ring-ring"
              role="article"
              aria-label={metric.ariaLabel}
              tabIndex={0}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
                  <p className={`text-4xl font-bold tracking-tight text-foreground`}>
                    <span className={metric.color}>{metric.value}</span>
                  </p>
                </div>
                <div className={`rounded-lg ${metric.bgColor} p-3`} aria-hidden="true">
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
              <div className={`absolute inset-x-0 bottom-0 h-1 ${metric.bgColor} opacity-50`} aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
