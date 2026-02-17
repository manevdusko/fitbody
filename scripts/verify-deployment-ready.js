#!/usr/bin/env node

/**
 * Verify Deployment Readiness
 * 
 * This script checks if your project is ready for GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  const result = condition();
  checks.push({ name, passed: result, message });
  if (result) {
    passed++;
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}`);
    if (message) console.log(`   ${message}`);
  }
}

console.log('\n🔍 Verifying deployment readiness...\n');

// Check if required files exist
check(
  'GitHub Actions workflow exists',
  () => fs.existsSync('.github/workflows/deploy.yml'),
  'Create .github/workflows/deploy.yml for automatic deployment'
);

check(
  'next.config.js exists',
  () => fs.existsSync('next.config.js'),
  'next.config.js is required for Next.js configuration'
);

check(
  'package.json exists',
  () => fs.existsSync('package.json'),
  'package.json is required for dependencies'
);

// Check next.config.js configuration
if (fs.existsSync('next.config.js')) {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  check(
    'Static export is enabled',
    () => nextConfig.includes("output: 'export'"),
    'Add output: "export" to next.config.js'
  );
  
  check(
    'API domain is configured',
    () => nextConfig.includes('api.fitbody.mk'),
    'Update next.config.js to use api.fitbody.mk'
  );
  
  check(
    'Images are unoptimized',
    () => nextConfig.includes('unoptimized: true'),
    'Add unoptimized: true to images config for static export'
  );
}

// Check package.json
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  check(
    'Next.js is installed',
    () => packageJson.dependencies && packageJson.dependencies.next,
    'Install Next.js: npm install next'
  );
  
  check(
    'Build script exists',
    () => packageJson.scripts && packageJson.scripts.build,
    'Add build script to package.json'
  );
}

// Check API configuration
if (fs.existsSync('src/utils/api.ts')) {
  const apiConfig = fs.readFileSync('src/utils/api.ts', 'utf8');
  
  check(
    'API URL points to api.fitbody.mk',
    () => apiConfig.includes('api.fitbody.mk'),
    'Update src/utils/api.ts to use api.fitbody.mk'
  );
}

// Check if node_modules exists
check(
  'Dependencies are installed',
  () => fs.existsSync('node_modules'),
  'Run: npm install'
);

// Check if .env.example is updated
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  
  check(
    '.env.example is updated',
    () => envExample.includes('api.fitbody.mk'),
    'Update .env.example with api.fitbody.mk URLs'
  );
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 Your project is ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Push to GitHub: git push origin main');
  console.log('2. Enable GitHub Pages in repository settings');
  console.log('3. Set source to "GitHub Actions"');
  console.log('4. Monitor deployment in Actions tab\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the issues above before deploying.');
  console.log('\nFor help, see:');
  console.log('- DEPLOYMENT.md for deployment guide');
  console.log('- QUICKSTART.md for quick setup');
  console.log('- WORDPRESS_API_SETUP.md for API configuration\n');
  process.exit(1);
}
