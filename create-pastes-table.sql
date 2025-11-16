-- Create pastes table in Supabase
CREATE TABLE IF NOT EXISTS pastes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT NOT NULL,
  language TEXT,
  privacy TEXT NOT NULL CHECK (privacy IN ('public', 'unlisted', 'private')),
  secret_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_pastes_slug ON pastes(slug);

-- Create index on privacy for filtering
CREATE INDEX IF NOT EXISTS idx_pastes_privacy ON pastes(privacy);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);
