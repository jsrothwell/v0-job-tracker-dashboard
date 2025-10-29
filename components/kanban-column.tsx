import { useDroppable } from "@dnd-kit/core"
import { JobCard } from "@/components/job-card"
import { Badge } from "@/components/ui/badge"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface Job {
  id: string
  job_title: string
  company_name: string
  date_applied: string | null
  expected_salary: string | null
  contact_name: string | null
  status: JobStatus
}

interface KanbanColumnProps {
  id: JobStatus
  title: string
  color: string
  jobs: Job[]
  onDeleteJob: (jobId: string) => void
}

export function KanbanColumn({ id, title, color, jobs, onDeleteJob }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`glass-card flex min-h-[600px] flex-col rounded-xl p-4 transition-all ${
        isOver ? "ring-2 ring-primary shadow-xl" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <Badge variant="secondary" className="rounded-full px-2.5 text-xs font-bold">
          {jobs.length}
        </Badge>
      </div>
      <div className="space-y-3 overflow-y-auto">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onDelete={onDeleteJob} />
        ))}
      </div>
    </div>
  )
}
