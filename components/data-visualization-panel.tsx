"use client"

import { ApplicationFunnelChart } from "@/components/application-funnel-chart"
import { TimeSeriesChart } from "@/components/time-series-chart"
import { KeyMetrics } from "@/components/key-metrics"

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
  return (
    <div className="space-y-6">
      <KeyMetrics jobs={jobs} />

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Visualize your job search progress and conversion rates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <div className="mb-6 space-y-1">
            <h3 className="text-xl font-semibold">Application Funnel</h3>
            <p className="text-sm text-muted-foreground">Track conversion rates across each stage</p>
          </div>
          <ApplicationFunnelChart jobs={jobs} />
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="mb-6 space-y-1">
            <h3 className="text-xl font-semibold">Application Timeline</h3>
            <p className="text-sm text-muted-foreground">Monitor your application activity over time</p>
          </div>
          <TimeSeriesChart jobs={jobs} />
        </div>
      </div>
    </div>
  )
}
