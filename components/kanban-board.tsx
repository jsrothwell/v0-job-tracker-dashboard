"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { KanbanColumn } from "@/components/kanban-column"
import { JobCard } from "@/components/job-card"
import { AddJobDialog } from "@/components/add-job-dialog"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface Job {
  id: string
  user_id: string
  job_title: string
  company_name: string
  date_applied: string | null
  expected_salary: string | null
  contact_name: string | null
  status: JobStatus
  created_at: string
  updated_at: string
}

interface KanbanBoardProps {
  initialJobs: Job[]
  userId: string
}

const COLUMNS: { id: JobStatus; title: string; color: string }[] = [
  { id: "Wishlist", title: "Wishlist", color: "bg-chart-3/10 border-chart-3/20" },
  { id: "Applied", title: "Applied", color: "bg-chart-1/10 border-chart-1/20" },
  { id: "Interviewing", title: "Interviewing", color: "bg-chart-4/10 border-chart-4/20" },
  { id: "Offer", title: "Offer", color: "bg-chart-5/10 border-chart-5/20" },
  { id: "Rejected", title: "Rejected", color: "bg-destructive/10 border-destructive/20" },
]

export function KanbanBoard({ initialJobs, userId }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id)
    setActiveJob(job || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)

    if (!over) return

    const jobId = active.id as string
    const newStatus = over.id as JobStatus

    const job = jobs.find((j) => j.id === jobId)
    if (!job || job.status === newStatus) return

    // Optimistic update
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)))

    // Update in database
    const { error } = await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId).eq("user_id", userId)

    if (error) {
      console.error("Failed to update job status:", error)
      // Revert on error
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: job.status } : j)))
    }
  }

  const handleAddJob = async (jobData: Omit<Job, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("jobs")
      .insert([{ ...jobData, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error("Failed to add job:", error)
      return
    }

    if (data) {
      setJobs((prev) => [data, ...prev])
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId).eq("user_id", userId)

    if (error) {
      console.error("Failed to delete job:", error)
      return
    }

    setJobs((prev) => prev.filter((j) => j.id !== jobId))
  }

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Application Pipeline</h2>
          <p className="text-muted-foreground">Track your job applications across different stages</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              jobs={getJobsByStatus(column.id)}
              onDeleteJob={handleDeleteJob}
            />
          ))}
        </div>

        <DragOverlay>
          {activeJob ? (
            <div className="rotate-3 opacity-80">
              <JobCard job={activeJob} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddJobDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddJob} />
    </div>
  )
}
