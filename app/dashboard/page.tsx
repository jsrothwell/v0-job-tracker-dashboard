import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/kanban-board"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataVisualizationPanel } from "@/components/data-visualization-panel"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: jobs } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto space-y-8 p-6" aria-label="Job application dashboard">
        <DataVisualizationPanel jobs={jobs || []} />
        <KanbanBoard initialJobs={jobs || []} userId={user.id} />
      </main>
    </div>
  )
}
