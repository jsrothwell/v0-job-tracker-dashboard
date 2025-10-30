"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DollarSign,
  User,
  Linkedin,
  Users,
  TrendingUp,
  Star,
  ExternalLink,
  Briefcase,
  FileText,
  MapPin,
  Trash2,
  Save,
  Plus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Job {
  id: string
  job_title: string
  company_name: string
  location?: string | null
  job_type?: string | null
  date_applied: string | null
  expected_salary: string | null
  contact_name: string | null
  status: string
  has_resume?: boolean
  has_cover_letter?: boolean
}

interface CompanyInsights {
  industry?: string
  company_size?: string
  glassdoor_rating?: number
  recent_news_url?: string
}

interface JobNote {
  id: string
  note_text: string
  created_at: string
}

interface JobDetailDialogProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (job: Job) => void
  onDelete?: (jobId: string) => void
}

export function JobDetailDialog({ job, open, onOpenChange, onUpdate, onDelete }: JobDetailDialogProps) {
  const [editedJob, setEditedJob] = useState<Job | null>(null)
  const [companyInsights, setCompanyInsights] = useState<CompanyInsights>({})
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notes, setNotes] = useState<JobNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)

  useEffect(() => {
    if (job) {
      setEditedJob({ ...job })
    }
  }, [job])

  useEffect(() => {
    if (job && open) {
      fetchCompanyInsights(job.company_name)
      fetchNotes(job.id)
    }
  }, [job, open])

  const fetchNotes = async (jobId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("job_notes")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setNotes(data)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !job) return

    setIsAddingNote(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) return

    const { error } = await supabase.from("job_notes").insert({
      job_id: job.id,
      user_id: userData.user.id,
      note_text: newNote.trim(),
    })

    if (!error) {
      setNewNote("")
      await fetchNotes(job.id)
    }
    setIsAddingNote(false)
  }

  const fetchCompanyInsights = async (companyName: string) => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch(`/api/company-insights?company=${encodeURIComponent(companyName)}`)
      if (response.ok) {
        const data = await response.json()
        setCompanyInsights(data)
      }
    } catch (error) {
      console.error("Failed to fetch company insights:", error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const handleLinkedInSearch = () => {
    if (!editedJob) return
    const searchQuery = editedJob.contact_name
      ? `${editedJob.contact_name} ${editedJob.company_name}`
      : editedJob.company_name
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`, "_blank")
  }

  const handleSave = async () => {
    if (!editedJob || !onUpdate) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("jobs")
        .update({
          job_title: editedJob.job_title,
          company_name: editedJob.company_name,
          location: editedJob.location,
          job_type: editedJob.job_type,
          date_applied: editedJob.date_applied,
          expected_salary: editedJob.expected_salary,
          contact_name: editedJob.contact_name,
          status: editedJob.status,
        })
        .eq("id", editedJob.id)

      if (!error) {
        onUpdate(editedJob)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to update job:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editedJob || !onDelete) return
    if (!confirm("Are you sure you want to delete this job application?")) return

    const supabase = createClient()
    const { error } = await supabase.from("jobs").delete().eq("id", editedJob.id)

    if (!error) {
      onDelete(editedJob.id)
      onOpenChange(false)
    }
  }

  if (!editedJob) return null

  // 1. Update DialogContent: Add !p-0 and keep max-h, flex, flex-col
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col !p-0">

        {/* 2. Update DialogHeader: Add padding */}
        <DialogHeader className="p-6">
          <DialogTitle className="text-2xl">Edit Job Details</DialogTitle>
        </DialogHeader>

        {/* 3. Update ScrollArea: Add horizontal padding */}
              <ScrollArea className="flex-1 max-h-full px-6">
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Core Details */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Job Information
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_job_title">Job Title *</Label>
                  <Input
                    id="edit_job_title"
                    value={editedJob.job_title}
                    onChange={(e) => setEditedJob({ ...editedJob, job_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_company_name">Company Name *</Label>
                  <Input
                    id="edit_company_name"
                    value={editedJob.company_name}
                    onChange={(e) => setEditedJob({ ...editedJob, company_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit_location"
                      value={editedJob.location || ""}
                      onChange={(e) => setEditedJob({ ...editedJob, location: e.target.value })}
                      placeholder="San Francisco, CA"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_job_type">Job Type</Label>
                  <Select
                    value={editedJob.job_type || ""}
                    onValueChange={(value) => setEditedJob({ ...editedJob, job_type: value })}
                  >
                    <SelectTrigger id="edit_job_type">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-Office">In-Office</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_date_applied">Date Applied</Label>
                  <Input
                    id="edit_date_applied"
                    type="date"
                    value={editedJob.date_applied || ""}
                    onChange={(e) => setEditedJob({ ...editedJob, date_applied: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column: User Input Fields */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Information
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_expected_salary">Expected Salary</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit_expected_salary"
                      value={editedJob.expected_salary || ""}
                      onChange={(e) => setEditedJob({ ...editedJob, expected_salary: e.target.value })}
                      placeholder="$120,000"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_contact_name">Contact Name</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="edit_contact_name"
                        value={editedJob.contact_name || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, contact_name: e.target.value })}
                        placeholder="Jane Smith"
                        className="pl-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleLinkedInSearch}
                      className="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2] bg-transparent"
                      title="Find on LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recruiter or Hiring Manager</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_status">Application Stage *</Label>
                  <Select
                    value={editedJob.status}
                    onValueChange={(value) => setEditedJob({ ...editedJob, status: value })}
                  >
                    <SelectTrigger id="edit_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wishlist">Wishlist</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Documents Display */}
                {(editedJob.has_resume || editedJob.has_cover_letter) && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Documents Uploaded</p>
                      <p className="text-xs text-muted-foreground">
                        {editedJob.has_resume && editedJob.has_cover_letter
                          ? "Resume & Cover Letter"
                          : editedJob.has_resume
                            ? "Resume"
                            : "Cover Letter"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notes & Activity Log</h3>
                <Badge variant="secondary">{notes.length} notes</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note about this application..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    size="sm"
                    className="self-end"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <ScrollArea className="h-[200px] rounded-lg border p-4">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No notes yet. Add your first note above.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                          <p className="text-sm">{note.note_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            <Separator />

            {/* Company Insights Panel (Read-Only) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Quick Company Insights</h3>
              </div>

              {isLoadingInsights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Industry</p>
                      <p className="font-medium">{companyInsights.industry || "Technology"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Company Size</p>
                      <p className="font-medium">{companyInsights.company_size || "1,000-5,000 employees"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Glassdoor Rating</p>
                      <p className="font-medium flex items-center gap-1">
                        {companyInsights.glassdoor_rating || "4.2"}
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Recent News</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 font-medium text-primary"
                        onClick={() =>
                          window.open(
                            companyInsights.recent_news_url ||
                              `https://www.google.com/search?q=${encodeURIComponent(editedJob.company_name)}+news&tbm=nws`,
                            "_blank",
                          )
                        }
                      >
                        View Latest News
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* 4. Update DialogFooter: Add padding */}
              <DialogFooter className="border-t pt-4 p-6">
          <div className="flex justify-between w-full">
            <Button variant="destructive" onClick={handleDelete} size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Job
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
