"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationFunnelChart } from "@/components/application-funnel-chart"
import { TimeSeriesChart } from "@/components/time-series-chart"

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
      <div>
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Visualize your job search progress and conversion rates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>Track conversion rates across each stage of your job search</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationFunnelChart jobs={jobs} />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>Monitor your application activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart jobs={jobs} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
