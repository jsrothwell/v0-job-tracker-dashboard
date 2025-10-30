"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Link2, Loader2, Sparkles, ArrowLeft } from "lucide-react"

type JobStatus = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected"

interface AddJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (job: {
    job_title: string
    company_name: string
    date_applied: string | null
    expected_salary: string | null
    contact_name: string | null
    status: JobStatus
    has_resume?: boolean
    has_cover_letter?: boolean
  }) => void
}

type ViewMode = "choice" | "url" | "manual"

export function AddJobDialog({ open, onOpenChange, onAdd }: AddJobDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("choice")
  const [jobUrl, setJobUrl] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<{
    job_title?: string
    company_name?: string
    location?: string
    description?: string
  }>({})

  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    date_applied: "",
    expected_salary: "",
    contact_name: "",
    status: "Wishlist" as JobStatus,
    has_resume: false,
    has_cover_letter: false,
  })

  const handleExtractFromUrl = async () => {
    if (!jobUrl.trim()) return

    setIsExtracting(true)
    try {
      const response = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      })

      if (!response.ok) throw new Error("Failed to extract job data")

      const data = await response.json()
      setExtractedData(data)

      // Pre-populate form with extracted data
      setFormData({
        ...formData,
        job_title: data.job_title || "",
        company_name: data.company_name || "",
      })

      setViewMode("manual")
    } catch (error) {
      console.error("[v0] Error extracting job data:", error)
      alert("Failed to extract job data. Please enter details manually.")
      setViewMode("manual")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      date_applied: formData.date_applied || null,
      expected_salary: formData.expected_salary || null,
      contact_name: formData.contact_name || null,
    })
    // Reset state
    setFormData({
      job_title: "",
      company_name: "",
      date_applied: "",
      expected_salary: "",
      contact_name: "",
      status: "Wishlist",
      has_resume: false,
      has_cover_letter: false,
    })
    setJobUrl("")
    setExtractedData({})
    setViewMode("choice")
    onOpenChange(false)
  }

  const handleBack = () => {
    setViewMode("choice")
    setJobUrl("")
    setExtractedData({})
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setViewMode("choice")
      setJobUrl("")
      setExtractedData({})
      setFormData({
        job_title: "",
        company_name: "",
        date_applied: "",
        expected_salary: "",
        contact_name: "",
        status: "Wishlist",
        has_resume: false,
        has_cover_letter: false,
      })
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[550px]">
        {/* Choice View */}
        {viewMode === "choice" && (
          <>
            <DialogHeader>
              <DialogTitle>Add New Job Application</DialogTitle>
              <DialogDescription>Choose how you'd like to add your job application.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <Button
                onClick={() => setViewMode("url")}
                className="w-full h-auto py-6 flex flex-col items-center gap-3 bg-primary hover:bg-primary/90"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-lg font-semibold">Auto-Fill from URL</span>
                </div>
                <span className="text-sm font-normal opacity-90">Paste a job posting link to auto-extract details</span>
              </Button>
              <Button
                onClick={() => setViewMode("manual")}
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center gap-3"
              >
                <span className="text-lg font-semibold">Enter Details Manually</span>
                <span className="text-sm font-normal text-muted-foreground">Fill in the job information yourself</span>
              </Button>
            </div>
          </>
        )}

        {/* URL Input View */}
        {viewMode === "url" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>Paste Job URL</DialogTitle>
              </div>
              <DialogDescription>
                Paste a link to a job posting from LinkedIn, Indeed, or other job boards.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="job_url" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Job Posting URL
                </Label>
                <Input
                  id="job_url"
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleExtractFromUrl}
                  disabled={!jobUrl.trim() || isExtracting}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Auto-Extract & Fill
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Manual Entry Form */}
        {viewMode === "manual" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                {Object.keys(extractedData).length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <DialogTitle>Job Application Details</DialogTitle>
              </div>
              <DialogDescription>
                {Object.keys(extractedData).length > 0
                  ? "Review and complete the auto-filled information below."
                  : "Enter the details of your job application to track it in your pipeline."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job_title" className="flex items-center gap-2">
                  Job Title *
                  {extractedData.job_title && (
                    <span className="text-xs text-primary font-normal flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Auto-filled
                    </span>
                  )}
                </Label>
                <Input
                  id="job_title"
                  required
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Senior Software Engineer"
                  className={extractedData.job_title ? "bg-primary/5 border-primary/20" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2">
                  Company Name *
                  {extractedData.company_name && (
                    <span className="text-xs text-primary font-normal flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Auto-filled
                    </span>
                  )}
                </Label>
                <Input
                  id="company_name"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Acme Corp"
                  className={extractedData.company_name ? "bg-primary/5 border-primary/20" : ""}
                />
              </div>

              {extractedData.location && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Extracted Location</Label>
                  <p className="text-sm">{extractedData.location}</p>
                </div>
              )}

              {extractedData.description && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Job Description Snippet
                  </Label>
                  <Textarea
                    value={extractedData.description}
                    readOnly
                    className="bg-primary/5 border-primary/20 text-sm h-24 resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_applied">Date Applied</Label>
                  <Input
                    id="date_applied"
                    type="date"
                    value={formData.date_applied}
                    onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_salary">Expected Salary</Label>
                  <Input
                    id="expected_salary"
                    value={formData.expected_salary}
                    onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                    placeholder="$120,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name (Recruiter/Hiring Manager)</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: JobStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
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

              <div className="space-y-3">
                <Label>Documents</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_resume"
                    checked={formData.has_resume}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_resume: checked as boolean })}
                  />
                  <label
                    htmlFor="has_resume"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Resume uploaded
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_cover_letter"
                    checked={formData.has_cover_letter}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_cover_letter: checked as boolean })}
                  />
                  <label
                    htmlFor="has_cover_letter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cover letter uploaded
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Save Job
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
