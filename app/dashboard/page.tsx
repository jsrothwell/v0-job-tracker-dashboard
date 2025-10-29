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
  const { data: jobs } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
  return jobs || []
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const { data: jobs = [], mutate } = useSWR("jobs", fetcher, {
    refreshInterval: 3000, // Refresh every 3 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto space-y-8 p-6" aria-label="Job application dashboard">
        <DataVisualizationPanel jobs={jobs} />
        <KanbanBoard initialJobs={jobs} userId={user.id} onJobsChange={() => mutate()} />
      </main>
    </div>
  )
}
