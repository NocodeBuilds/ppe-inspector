// A script to fix build issues with the PPE Inspector app
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create a directory for the build
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Create a basic index.html file to test the Supabase connection
const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PPE Inspector Supabase Test</title>
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    .container {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }
    h1 {
      color: #1f2937;
      margin-top: 0;
    }
    h2 {
      color: #374151;
    }
    .status {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      display: inline-block;
      font-weight: 500;
    }
    .success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .error {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .info {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    pre {
      background-color: #f3f4f6;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    button {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background-color: #2563eb;
    }
    textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #d1d5db;
    }
  </style>
</head>
<body>
  <h1>PPE Inspector Supabase Connection Test</h1>
  
  <div class="container">
    <h2>Connection Status</h2>
    <div id="connection-status">Testing connection...</div>
  </div>
  
  <div class="container">
    <h2>Database Tables</h2>
    <div id="tables-list">Loading tables...</div>
  </div>
  
  <div class="container">
    <h2>Run Custom Query</h2>
    <textarea id="query-input" placeholder="Enter SQL query (e.g., SELECT * FROM profiles LIMIT 5)"></textarea>
    <button id="run-query">Run Query</button>
    <div id="query-results">Results will appear here</div>
  </div>

  <script>
    // Initialize Supabase client
    const SUPABASE_URL = 'https://gpbrwftznpsaibwxfoxl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYnJ3ZnR6bnBzYWlid3hmb3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjU1NDAsImV4cCI6MjA2MjY0MTU0MH0.oVSM3JNi5nufXi4q4tho6HfyFHu3hkEBwDh-4wJIBX4';
    
    // Create Supabase client
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // DOM elements
    const connectionStatus = document.getElementById('connection-status');
    const tablesList = document.getElementById('tables-list');
    const queryInput = document.getElementById('query-input');
    const runQueryBtn = document.getElementById('run-query');
    const queryResults = document.getElementById('query-results');
    
    // Test connection
    async function testConnection() {
      try {
        // Simple query to test connection
        const { data, error } = await supabase
          .from('profiles')
          .select('count(*)', { count: 'exact' })
          .limit(0);
        
        if (error) {
          connectionStatus.innerHTML = \`
            <div class="status error">Connection Failed</div>
            <p>Error message: \${error.message}</p>
          \`;
        } else {
          connectionStatus.innerHTML = \`
            <div class="status success">Connection Successful</div>
            <p>Connected to Supabase project at \${SUPABASE_URL}</p>
          \`;
        }
      } catch (error) {
        connectionStatus.innerHTML = \`
          <div class="status error">Connection Failed</div>
          <p>Error message: \${error.message}</p>
        \`;
      }
    }
    
    // Get list of tables
    async function listTables() {
      try {
        // This is a system table that lists all tables
        const { data, error } = await supabase
          .rpc('get_schema_info');
        
        if (error) {
          // Fallback to get some table info directly
          const tables = ['profiles', 'ppe_items', 'inspections', 'inspection_templates', 'checkpoints'];
          let tableHTML = '<ul>';
          
          for (const table of tables) {
            const { data, error } = await supabase
              .from(table)
              .select('count(*)', { count: 'exact' })
              .limit(0);
              
            if (error) {
              tableHTML += \`<li>\${table}: <span class="status error">Error: \${error.message}</span></li>\`;
            } else {
              tableHTML += \`<li>\${table}: <span class="status success">Available</span></li>\`;
            }
          }
          
          tableHTML += '</ul>';
          tablesList.innerHTML = tableHTML;
        } else {
          // Format the table list
          let tableHTML = '<ul>';
          
          data.forEach(table => {
            tableHTML += \`<li>\${table.table_name}: <span class="status info">\${table.table_type}</span></li>\`;
          });
          
          tableHTML += '</ul>';
          tablesList.innerHTML = tableHTML;
        }
      } catch (error) {
        tablesList.innerHTML = \`
          <div class="status error">Failed to list tables</div>
          <p>Error message: \${error.message}</p>
        \`;
      }
    }
    
    // Run custom query
    async function runCustomQuery() {
      const query = queryInput.value.trim();
      
      if (!query) {
        queryResults.innerHTML = '<div class="status error">Please enter a query</div>';
        return;
      }
      
      queryResults.innerHTML = '<div class="status info">Running query...</div>';
      
      try {
        const { data, error } = await supabase.rpc('run_sql_query', { query_text: query });
        
        if (error) {
          queryResults.innerHTML = \`
            <div class="status error">Query Failed</div>
            <p>Error message: \${error.message}</p>
          \`;
        } else {
          queryResults.innerHTML = \`
            <div class="status success">Query Successful</div>
            <pre>\${JSON.stringify(data, null, 2)}</pre>
          \`;
        }
      } catch (error) {
        queryResults.innerHTML = \`
          <div class="status error">Query Failed</div>
          <p>Error message: \${error.message}</p>
        \`;
      }
    }
    
    // Event listeners
    runQueryBtn.addEventListener('click', runCustomQuery);
    
    // Initialize
    testConnection();
    listTables();
  </script>
</body>
</html>
`;

// Write the test HTML file
fs.writeFileSync(path.join(buildDir, 'index.html'), testHtml);

console.log('Created test page at dist/index.html');
console.log('To test your Supabase connection, you can serve this directory with a simple HTTP server.');
console.log('Try running: npx serve dist');
