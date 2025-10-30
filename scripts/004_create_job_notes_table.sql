-- Create job_notes table for activity log and notes
CREATE TABLE IF NOT EXISTS job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own job notes"
  ON job_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job notes"
  ON job_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job notes"
  ON job_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job notes"
  ON job_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON job_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_job_notes_user_id ON job_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_notes_created_at ON job_notes(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_notes_updated_at
  BEFORE UPDATE ON job_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_job_notes_updated_at();

COMMENT ON TABLE job_notes IS 'Stores notes and activity log entries for job applications';
