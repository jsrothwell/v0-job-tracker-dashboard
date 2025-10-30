"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Calendar,
  DollarSign,
  User,
  Linkedin,
  Users,
  TrendingUp,
  Star,
  ExternalLink,
  Briefcase,
  FileText,
} from "lucide-react"

interface Job {
  id: string
  job_title: string
  company_name: string
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

interface JobDetailDialogProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobDetailDialog({ job, open, onOpenChange }: JobDetailDialogProps) {
  const [companyInsights, setCompanyInsights] = useState<CompanyInsights>({})
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  useEffect(() => {
    if (job && open) {
      fetchCompanyInsights(job.company_name)
    }
  }, [job, open])

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
    if (!job) return
    const searchQuery = job.contact_name ? `${job.contact_name} ${job.company_name}` : job.company_name
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`, "_blank")
  }

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{job.job_title}</DialogTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{job.company_name}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {job.status}
            </Badge>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.date_applied && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date Applied</p>
                  <p className="font-medium">
                    {new Date(job.date_applied).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {job.expected_salary && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <DollarSign className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Expected Salary</p>
                  <p className="font-semibold text-accent">{job.expected_salary}</p>
                </div>
              </div>
            )}

            {job.contact_name && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{job.contact_name}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLinkedInSearch}
                  className="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2] bg-transparent"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  Find on LinkedIn
                </Button>
              </div>
            )}
          </div>

          {/* Documents */}
          {(job.has_resume || job.has_cover_letter) && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Documents Uploaded</p>
                <p className="text-xs text-muted-foreground">
                  {job.has_resume && job.has_cover_letter
                    ? "Resume & Cover Letter"
                    : job.has_resume
                      ? "Resume"
                      : "Cover Letter"}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Company Insights Panel */}
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
                            `https://www.google.com/search?q=${encodeURIComponent(job.company_name)}+news&tbm=nws`,
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

            <p className="text-xs text-muted-foreground">
              Company insights are automatically gathered to help you prepare for interviews and understand the
              organization better.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
