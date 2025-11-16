-- Paste-Life Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the pastes table
create table public.pastes (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text,
  content text not null,
  language text,
  privacy text not null default 'unlisted',
  secret_token text not null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  views int default 0
);

-- Create indexes for better performance
create index on public.pastes (created_at desc);
create index on public.pastes (slug);
create index on public.pastes using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || content)
);

-- Enable Row Level Security (RLS)
alter table public.pastes enable row level security;

-- Allow anonymous users to insert pastes
create policy "Anyone can insert pastes"
  on public.pastes
  for insert
  to anon
  with check (true);

-- Allow anonymous users to select public and unlisted pastes
create policy "Anyone can view public and unlisted pastes"
  on public.pastes
  for select
  to anon
  using (privacy in ('public', 'unlisted'));

-- Note: Private pastes and edit/delete operations are handled
-- by the backend using the service role key for security
