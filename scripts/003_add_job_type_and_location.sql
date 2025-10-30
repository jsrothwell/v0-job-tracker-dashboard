-- Add job_type and location columns to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS job_type TEXT CHECK (job_type IN ('In-Office', 'Remote', 'Hybrid')),
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

COMMENT ON COLUMN jobs.job_type IS 'Type of work arrangement: In-Office, Remote, or Hybrid';
COMMENT ON COLUMN jobs.location IS 'Job location or office address';
