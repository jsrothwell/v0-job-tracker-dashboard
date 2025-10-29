"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, DollarSign, User, Linkedin, Trash2 } from "lucide-react"

interface Job {
  id: string
  job_title: string
  company_name: string
  date_applied: string | null
  expected_salary: string | null
  contact_name: string | null
  status: string
}

interface JobCardProps {
  job: Job
  onDelete: (jobId: string) => void
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const handleLinkedInSearch = () => {
    const searchQuery = job.contact_name ? `${job.contact_name} ${job.company_name}` : job.company_name
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`, "_blank")
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`glass-card-light cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      } group transition-all hover:scale-[1.02] hover:shadow-xl`}
      {...listeners}
      {...attributes}
    >
      <CardHeader className="space-y-2 p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 text-balance font-semibold leading-tight text-white">{job.job_title}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(job.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate font-medium">{job.company_name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        {job.date_applied && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-white/60" />
            <span className="text-white/70">
              {new Date(job.date_applied).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {job.expected_salary && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 shrink-0 text-chart-5" />
            <span className="font-semibold text-chart-5">{job.expected_salary}</span>
          </div>
        )}
        {job.contact_name && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 shrink-0 text-white/60" />
              <span className="truncate text-white/70">{job.contact_name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-[#0A66C2]/10"
              onClick={(e) => {
                e.stopPropagation()
                handleLinkedInSearch()
              }}
              title="Find on LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
