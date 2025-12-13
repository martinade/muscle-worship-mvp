#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Error patterns and their solutions
const ERROR_PATTERNS = {
  '404': {
    keywords: ['GET / 404', 'GET /?framework=NEXT_JS_APP_ROUTER 404', 'Not Found'],
    solution: 'docs/troubleshooting/solutions/next-js-pages-vs-app-router-404.md',
    autoFix: checkAndFixRouterIssue
  },
  'MODULE_NOT_FOUND': {
    keywords: ['Module not found', "Cannot find module", "Can't resolve"],
    solution: 'docs/troubleshooting/solutions/module-resolution.md',
    autoFix: null
  },
  'PORT_IN_USE': {
    keywords: ['EADDRINUSE', 'port already in use', 'address already in use'],
    solution: null,
    autoFix: killPortProcess
  }
};

function checkAndFixRouterIssue() {
  console.log('\n🔧 Attempting auto-fix for router issue...\n');
  
  const appDirExists = fs.existsSync('src/app');
  const layoutExists = fs.existsSync('src/app/layout.tsx');
  const pageExists = fs.existsSync('src/app/page.tsx');
  
  if (!appDirExists) {
    console.log('❌ src/app directory missing - cannot auto-fix');
    console.log('   Manual intervention required');
    return false;
  }
  
  if (!layoutExists || !pageExists) {
    console.log('⚠️  Missing required App Router files');
    console.log('   Run: npm run fix:router');
    return false;
  }
  
  return true;
}

function killPortProcess() {
  console.log('\n🔧 Attempting to free port 3000...\n');
  
  exec('lsof -ti:3000 | xargs kill -9', (error) => {
    if (error) {
      console.log('⚠️  Could not kill process on port 3000');
      console.log('   Try manually: lsof -ti:3000 | xargs kill -9');
    } else {
      console.log('✅ Port 3000 freed');
      console.log('   Restart dev server: npm run dev');
    }
  });
}

function analyzeError(errorText) {
  const matches = [];
  
  for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
    for (const keyword of config.keywords) {
      if (errorText.includes(keyword)) {
        matches.push({ errorType, config });
        break;
      }
    }
  }
  
  return matches;
}

function provideSolution(errorType, config) {
  console.log(`\n📋 Detected: ${errorType}\n`);
  
  if (config.solution && fs.existsSync(config.solution)) {
    console.log(`📖 Solution guide: ${config.solution}\n`);
    
    // Show first few lines of solution
    const content = fs.readFileSync(config.solution, 'utf-8');
    const lines = content.split('\n').slice(0, 15);
    console.log(lines.join('\n'));
    console.log('\n... (see full guide for complete solution)\n');
  }
  
  if (config.autoFix) {
    console.log('🤖 Auto-fix available\n');
    config.autoFix();
  }
}

function runDiagnostics() {
  console.log('🔍 Running automated diagnostics...\n');
  
  exec('bash scripts/diagnose.sh', (error, stdout, stderr) => {
    console.log(stdout);
    
    if (stderr) {
      const matches = analyzeError(stderr);
      matches.forEach(({ errorType, config }) => {
        provideSolution(errorType, config);
      });
    }
    
    // Check for critical issues in output
    if (stdout.includes('❌')) {
      console.log('\n⚠️  Critical issues detected!\n');
      console.log('Run: npm run diagnose:quick\n');
    }
  });
}

// Watch for errors in dev server output
function watchDevServer() {
  const { spawn } = require('child_process');
  const devServer = spawn('npm', ['run', 'dev'], { stdio: 'pipe' });
  
  let errorBuffer = '';
  
  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    // Analyze for errors
    const matches = analyzeError(output);
    if (matches.length > 0) {
      matches.forEach(({ errorType, config }) => {
        provideSolution(errorType, config);
      });
    }
  });
  
  devServer.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
    errorBuffer += output;
    
    // Analyze errors
    const matches = analyzeError(errorBuffer);
    if (matches.length > 0) {
      matches.forEach(({ errorType, config }) => {
        provideSolution(errorType, config);
      });
      errorBuffer = ''; // Clear buffer after analysis
    }
  });
  
  devServer.on('close', (code) => {
    if (code !== 0) {
      console.log(`\n❌ Dev server exited with code ${code}\n`);
      runDiagnostics();
    }
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--watch')) {
  console.log('👀 Starting dev server with auto-diagnostics...\n');
  watchDevServer();
} else {
  runDiagnostics();
}
