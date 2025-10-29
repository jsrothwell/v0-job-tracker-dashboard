"use client"

import { useState } from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { KanbanBoard } from "@/components/kanban-board"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataVisualizationPanel } from "@/components/data-visualization-panel"

const fetcher = async () => {
  const supabase = createClient()

  // Force fresh data fetch, bypassing all caches (especially important for Firefox)
  const { data: jobs, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

  console.log("[v0] Fetched jobs:", jobs?.length || 0, "jobs")

  if (error) {
    console.error("[v0] Error fetching jobs:", error)
    throw error
  }

  return jobs || []
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    data: jobs = [],
    mutate,
    error,
  } = useSWR("jobs", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0, // Disable deduping for Firefox compatibility
    revalidateOnMount: true, // Always fetch on mount
  })

  useEffect(() => {
    console.log("[v0] Jobs data updated:", jobs.length, "jobs")
  }, [jobs])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  if (error) {
    console.error("[v0] SWR error:", error)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto space-y-8 p-6" aria-label="Job application dashboard">
        <DataVisualizationPanel jobs={jobs} key={`viz-${jobs.length}-${Date.now()}`} />
        <KanbanBoard initialJobs={jobs} userId={user.id} onJobsChange={() => mutate()} />
      </main>
    </div>
  )
}
