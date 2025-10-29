"use client"

import { ApplicationFunnelChart } from "@/components/application-funnel-chart"
import { TimeSeriesChart } from "@/components/time-series-chart"
import { KeyMetrics } from "@/components/key-metrics"
import { useEffect } from "react"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface Job {
  id: string
  job_title: string
  company_name: string
  date_applied: string | null
  expected_salary: string | null
  contact_name: string | null
  status: JobStatus
  created_at: string
  updated_at: string
}

interface DataVisualizationPanelProps {
  jobs: Job[]
}

export function DataVisualizationPanel({ jobs }: DataVisualizationPanelProps) {
  useEffect(() => {
    console.log("[v0] DataVisualizationPanel received jobs:", jobs.length)
  }, [jobs])

  return (
    <section className="space-y-6" aria-labelledby="analytics-heading">
      <KeyMetrics jobs={jobs} />

      <div>
        <h2 id="analytics-heading" className="text-3xl font-bold tracking-tight text-foreground">
          Analytics Dashboard
        </h2>
        <p className="text-foreground/70">Visualize your job search progress and conversion rates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article
          className="glass-card rounded-xl p-6 focus-within:ring-2 focus-within:ring-ring"
          aria-labelledby="funnel-heading"
        >
          <div className="mb-6 space-y-1">
            <h3 id="funnel-heading" className="text-xl font-semibold text-foreground">
              Application Funnel
            </h3>
            <p className="text-sm text-foreground/70">Track conversion rates across each stage</p>
          </div>
          <ApplicationFunnelChart jobs={jobs} key={`funnel-${jobs.length}`} />
        </article>

        <article
          className="glass-card rounded-xl p-6 focus-within:ring-2 focus-within:ring-ring"
          aria-labelledby="timeline-heading"
        >
          <div className="mb-6 space-y-1">
            <h3 id="timeline-heading" className="text-xl font-semibold text-foreground">
              Application Timeline
            </h3>
            <p className="text-sm text-foreground/70">Monitor your application activity over time</p>
          </div>
          <TimeSeriesChart jobs={jobs} key={`timeline-${jobs.length}`} />
        </article>
      </div>
    </section>
  )
}
