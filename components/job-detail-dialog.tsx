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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
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
  AlertCircle,
  Search,
  Mail,
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
  hiring_manager_name?: string | null
  hiring_manager_email?: string | null
  hiring_manager_linkedin?: string | null
  hiring_manager_notes?: string | null
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
  const { toast } = useToast()
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

    if (!userData.user) {
      toast({
        title: "Error",
        description: "You must be logged in to add notes",
        variant: "destructive",
      })
      setIsAddingNote(false)
      return
    }

    const { error } = await supabase.from("job_notes").insert({
      job_id: job.id,
      user_id: userData.user.id,
      note_text: newNote.trim(),
    })

    if (!error) {
      setNewNote("")
      await fetchNotes(job.id)
      toast({
        title: "Note added",
        description: "Your note has been saved successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
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

  // New: Research helper functions for hiring manager
  const handleFindHiringManager = () => {
    if (!editedJob) return
    const jobTitle = editedJob.job_title.toLowerCase().includes('engineer') ? 'engineering manager' : 'hiring manager'
    const searchQuery = `${editedJob.company_name} ${jobTitle} ${editedJob.job_title}`
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`, "_blank")
  }

  const handleFindRecruiter = () => {
    if (!editedJob) return
    const searchQuery = `${editedJob.company_name} recruiter OR "talent acquisition"`
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`, "_blank")
  }

  const handleGoogleSearch = () => {
    if (!editedJob) return
    const searchQuery = `"${editedJob.company_name}" "${editedJob.job_title}" hiring manager`
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank")
  }

  const handleSave = async () => {
    console.log("Save button clicked")

    if (!editedJob) {
      console.error("No edited job data")
      toast({
        title: "Error",
        description: "No job data to save",
        variant: "destructive",
      })
      return
    }

    if (!onUpdate) {
      console.error("No onUpdate callback provided")
      toast({
        title: "Error",
        description: "Update function not available",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!editedJob.job_title || !editedJob.company_name) {
      toast({
        title: "Validation Error",
        description: "Job title and company name are required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      console.log("Attempting to save job:", editedJob)

      const supabase = createClient()
      const { error } = await supabase
        .from("jobs")
        .update({
          job_title: editedJob.job_title,
          company_name: editedJob.company_name,
          location: editedJob.location || null,
          job_type: editedJob.job_type || null,
          date_applied: editedJob.date_applied || null,
          expected_salary: editedJob.expected_salary || null,
          contact_name: editedJob.contact_name || null,
          status: editedJob.status,
          has_resume: editedJob.has_resume || false,
          has_cover_letter: editedJob.has_cover_letter || false,
          hiring_manager_name: editedJob.hiring_manager_name || null,
          hiring_manager_email: editedJob.hiring_manager_email || null,
          hiring_manager_linkedin: editedJob.hiring_manager_linkedin || null,
          hiring_manager_notes: editedJob.hiring_manager_notes || null,
        })
        .eq("id", editedJob.id)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Save successful")

      toast({
        title: "Success",
        description: "Job details updated successfully",
      })

      onUpdate(editedJob)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editedJob || !onDelete) return
    if (!confirm("Are you sure you want to delete this job application?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("jobs").delete().eq("id", editedJob.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job application deleted",
      })

      onDelete(editedJob.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!editedJob) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Edit Job Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_company_name">Company Name *</Label>
                  <Input
                    id="edit_company_name"
                    value={editedJob.company_name}
                    onChange={(e) => setEditedJob({ ...editedJob, company_name: e.target.value })}
                    required
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
                      className="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]"
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

                {/* Documents Section */}
                <div className="space-y-3">
                  <Label>Documents</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_has_resume"
                      checked={editedJob.has_resume || false}
                      onCheckedChange={(checked) =>
                        setEditedJob({ ...editedJob, has_resume: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="edit_has_resume"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Resume uploaded
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_has_cover_letter"
                      checked={editedJob.has_cover_letter || false}
                      onCheckedChange={(checked) =>
                        setEditedJob({ ...editedJob, has_cover_letter: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="edit_has_cover_letter"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Cover letter uploaded
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* New: Hiring Manager Research Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Hiring Manager / Recruiter
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFindHiringManager}
                    className="hover:bg-[#0A66C2]/10"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    Find Manager
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFindRecruiter}
                    className="hover:bg-[#0A66C2]/10"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    Find Recruiter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGoogleSearch}
                    className="hover:bg-blue-50"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Google
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hiring_manager_name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hiring_manager_name"
                      value={editedJob.hiring_manager_name || ""}
                      onChange={(e) => setEditedJob({ ...editedJob, hiring_manager_name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hiring_manager_email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hiring_manager_email"
                      type="email"
                      value={editedJob.hiring_manager_email || ""}
                      onChange={(e) => setEditedJob({ ...editedJob, hiring_manager_email: e.target.value })}
                      placeholder="john.doe@company.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hiring_manager_linkedin">LinkedIn Profile URL</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hiring_manager_linkedin"
                      type="url"
                      value={editedJob.hiring_manager_linkedin || ""}
                      onChange={(e) => setEditedJob({ ...editedJob, hiring_manager_linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/johndoe"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hiring_manager_notes">Notes</Label>
                  <Textarea
                    id="hiring_manager_notes"
                    value={editedJob.hiring_manager_notes || ""}
                    onChange={(e) => setEditedJob({ ...editedJob, hiring_manager_notes: e.target.value })}
                    placeholder="Add any notes about your interactions, mutual connections, or research findings..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row justify-between items-center border-t px-6 py-4 gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            size="sm"
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Job
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !editedJob.job_title || !editedJob.company_name}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
