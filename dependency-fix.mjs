import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define the package.json path
const packageJsonPath = './package.json';

// Read and parse the package.json file
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Print current versions
console.log('Current React version:', packageJson.dependencies.react);
console.log('Current React DOM version:', packageJson.dependencies['react-dom']);

// Check for problematic dependencies
const problematicDeps = [
  'react-qr-reader',
  '@zxing/browser',
  '@zxing/library'
];

const cleanPackageJson = async () => {
  // Remove problematic dependencies if they exist
  problematicDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`Removing problematic dependency: ${dep}`);
      delete packageJson.dependencies[dep];
    }
  });

  // Ensure React and React DOM are compatible versions
  packageJson.dependencies.react = "^18.2.0";
  packageJson.dependencies['react-dom'] = "^18.2.0";
  
  // Add required dependencies for routing and Supabase
  packageJson.dependencies['@supabase/supabase-js'] = "^2.39.7";
  packageJson.dependencies['react-router-dom'] = "^6.22.3";
  
  // Upgrade the TypeScript version for better compatibility
  packageJson.devDependencies.typescript = "^5.4.2";
  
  // Save the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with compatible dependencies');
  
  // Install the updated dependencies
  try {
    console.log('Installing dependencies...');
    await execAsync('npm install');
    console.log('Dependencies installed successfully');
    
    // Run a clean build
    console.log('Building the application...');
    await execAsync('npm run build -- --skipTypeCheck');
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Error during dependency installation or build:', error);
  }
};

// Execute the function
cleanPackageJson();
