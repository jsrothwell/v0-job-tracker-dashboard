"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  }) => void
}

export function AddJobDialog({ open, onOpenChange, onAdd }: AddJobDialogProps) {
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    date_applied: "",
    expected_salary: "",
    contact_name: "",
    status: "Wishlist" as JobStatus,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      date_applied: formData.date_applied || null,
      expected_salary: formData.expected_salary || null,
      contact_name: formData.contact_name || null,
    })
    setFormData({
      job_title: "",
      company_name: "",
      date_applied: "",
      expected_salary: "",
      contact_name: "",
      status: "Wishlist",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
          <DialogDescription>Enter the details of your job application to track it in your pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title *</Label>
            <Input
              id="job_title"
              required
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="Senior Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Acme Corp"
            />
          </div>
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
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Job</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
