-- Create jobs table for job application tracking
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null,
  company_name text not null,
  date_applied date,
  expected_salary text,
  contact_name text,
  status text not null default 'Wishlist' check (status in ('Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.jobs enable row level security;

-- RLS Policies for jobs table
create policy "Users can view their own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index if not exists jobs_user_id_idx on public.jobs(user_id);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_date_applied_idx on public.jobs(date_applied);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger to automatically update updated_at
create trigger jobs_updated_at
  before update on public.jobs
  for each row
  execute function public.handle_updated_at();
