import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load .env file manually since this is a standalone script
const loadEnv = () => {
  try {
    const envContent = fs.readFileSync('./.env', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error loading .env file:', error);
    return {};
  }
};

const env = loadEnv();

// Use the values from .env or fallback to hardcoded values
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://gpbrwftznpsaibwxfoxl.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYnJ3ZnR6bnBzYWlid3hmb3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjU1NDAsImV4cCI6MjA2MjY0MTU0MH0.oVSM3JNi5nufXi4q4tho6HfyFHu3hkEBwDh-4wJIBX4';

console.log('Connecting to Supabase at:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist the session for this test
    autoRefreshToken: false,
  },
});

// Test the connection by querying different tables
const tablesToTest = [
  'profiles',
  'ppe_items',
  'inspections',
  'inspection_templates',
  'checkpoints'
];

const runTests = async () => {
  console.log('Starting Supabase connection tests...');
  
  // First test: Check if we can connect to the REST API
  try {
    console.log('\nTesting REST API availability...');
    const { data: health, error: healthError } = await supabase.from('healthcheck').select('*').limit(1);
    
    if (healthError) {
      console.log('❌ REST API check failed:', healthError.message);
    } else {
      console.log('✅ REST API is accessible');
    }
  } catch (error) {
    console.log('❌ REST API check failed:', error.message);
  }
  
  // Second test: Try to get table information for each table
  for (const table of tablesToTest) {
    try {
      console.log(`\nTesting access to '${table}' table...`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        console.log(`❌ Failed to query '${table}':`, error.message);
      } else {
        console.log(`✅ Successfully accessed '${table}' table`);
        console.log(`   Found ${count} records total`);
        console.log(`   Sample data:`, data?.length ? JSON.stringify(data[0], null, 2).substring(0, 150) + '...' : 'No data');
      }
    } catch (error) {
      console.log(`❌ Error accessing '${table}':`, error.message);
    }
  }
  
  console.log('\nConnection tests completed.');
};

runTests()
  .catch(error => {
    console.error('Test failed with error:', error);
  });
