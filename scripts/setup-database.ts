import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createTableSQL = `
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
`;

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');
  
  try {
    // Execute the SQL using Supabase's RPC or direct SQL execution
    // Note: Supabase client doesn't have direct SQL execution from client
    // This needs to be run in Supabase SQL Editor or using a migration tool
    
    console.log('📝 SQL to execute in Supabase SQL Editor:');
    console.log('='.repeat(50));
    console.log(createTableSQL);
    console.log('='.repeat(50));
    
    console.log('\n✅ Please run the SQL above in your Supabase project:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Navigate to SQL Editor');
    console.log('   4. Copy and paste the SQL above');
    console.log('   5. Click "Run"');
    console.log('\n💡 Alternatively, you can use Supabase CLI: supabase db push');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupDatabase();
