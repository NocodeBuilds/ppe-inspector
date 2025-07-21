
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gpbrwftznpsaibwxfoxl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYnJ3ZnR6bnBzYWlid3hmb3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjU1NDAsImV4cCI6MjA2MjY0MTU0MH0.oVSM3JNi5nufXi4q4tho6HfyFHu3hkEBwDh-4wJIBX4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
