import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTable() {
  console.log('🚀 Checking if pastes table exists in Supabase...\n');
  
  // Check if table exists by trying to query it
  const { data, error } = await supabase
    .from('pastes')
    .select('id')
    .limit(1);
  
  if (error && error.code === 'PGRST116') {
    console.log('❌ Table does not exist. Please run this SQL in your Supabase SQL Editor:\n');
    console.log('='.repeat(70));
    console.log(`
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

CREATE INDEX IF NOT EXISTS idx_pastes_slug ON pastes(slug);
CREATE INDEX IF NOT EXISTS idx_pastes_privacy ON pastes(privacy);
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);
    `);
    console.log('='.repeat(70));
    console.log('\n📍 Steps to create the table:');
    console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Click "Run"');
    console.log('4. Restart the application\n');
  } else if (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\nPlease ensure your Supabase credentials are correct.');
  } else {
    console.log('✅ Table "pastes" already exists and is accessible!');
  }
}

setupTable().catch(console.error);
