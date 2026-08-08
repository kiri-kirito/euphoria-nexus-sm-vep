const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// We use the SERVICE_ROLE_KEY here to bypass Row Level Security (RLS)
// The backend needs admin privileges to safely handle escrows, bundles, etc.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing Supabase environment variables in backend/.env');
  // Don't exit immediately, let the server start so we can see the errors
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

module.exports = { supabase };
