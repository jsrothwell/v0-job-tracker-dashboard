-- Add document tracking columns to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS has_resume BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_cover_letter BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.has_resume IS 'Indicates if a resume has been uploaded for this job application';
COMMENT ON COLUMN public.jobs.has_cover_letter IS 'Indicates if a cover letter has been uploaded for this job application';
