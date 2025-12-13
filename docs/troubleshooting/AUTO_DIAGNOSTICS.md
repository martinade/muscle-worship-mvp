# Automated Diagnostics System

## Overview

This project now has an automated diagnostics system that:
- ✅ Detects errors automatically
- ✅ Provides instant solutions
- ✅ Auto-fixes common issues
- ✅ Runs on every `npm install`
- ✅ Watches dev server for errors

## Usage

### Automatic Mode (Recommended)

```bash
# Start dev server with auto-diagnostics
npm run dev:watch
```

This will:
1. Start the Next.js dev server
2. Monitor output for errors
3. Automatically detect issues
4. Provide solutions in real-time
5. Attempt auto-fixes when possible

### Manual Diagnostics

```bash
# Run full diagnostics
npm run diagnose

# Quick check (errors only)
npm run diagnose:quick

# Auto-analyze and suggest fixes
npm run diagnose:auto
```

### Auto-Fix Commands

```bash
# Fix router configuration (404 errors)
npm run fix:router

# Free port 3000
npm run fix:port
```

## How It Works

### 1. Error Detection

The system monitors for these patterns:

| Error Type | Detection Keywords | Auto-Fix |
|------------|-------------------|----------|
| 404 Errors | `GET / 404`, `NEXT_JS_APP_ROUTER` | ✅ Yes |
| Module Not Found | `Module not found`, `Can't resolve` | ❌ Manual |
| Port In Use | `EADDRINUSE`, `port already in use` | ✅ Yes |

### 2. Automatic Solutions

When an error is detected:
1. **Identify** the error pattern
2. **Locate** the relevant solution guide
3. **Display** quick fix instructions
4. **Attempt** auto-fix if available
5. **Verify** the fix worked

### 3. Post-Install Check

After every `npm install`, the system:
- Runs diagnostics automatically
- Checks for configuration issues
- Validates project structure
- Reports any problems

## Configuration

### Add New Error Patterns

Edit `scripts/auto-diagnose.js`:

```javascript
const ERROR_PATTERNS = {
  'YOUR_ERROR': {
    keywords: ['error keyword 1', 'error keyword 2'],
    solution: 'docs/troubleshooting/solutions/your-solution.md',
    autoFix: yourAutoFixFunction
  }
};
```

### Create Auto-Fix Function

```javascript
function yourAutoFixFunction() {
  console.log('\n🔧 Attempting auto-fix...\n');
  
  // Your fix logic here
  
  if (success) {
    console.log('✅ Fixed!');
    return true;
  } else {
    console.log('❌ Manual intervention required');
    return false;
  }
}
```

## VS Code Integration

The system includes VS Code tasks:

1. **Open Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. **Select** "Tasks: Run Task"
3. **Choose:**
   - "Dev Server with Auto-Diagnostics"
   - "Run Diagnostics"
   - "Auto-Fix Router"

## Examples

### Example 1: 404 Error Auto-Fix

```bash
$ npm run dev:watch

🔍 Running automated diagnostics...

📋 Detected: 404

📖 Solution guide: docs/troubleshooting/solutions/next-js-pages-vs-app-router-404.md

🤖 Auto-fix available

🔧 Attempting auto-fix for router issue...

⚠️  Missing required App Router files
   Run: npm run fix:router

$ npm run fix:router

🔧 Auto-fixing Router Configuration...
📁 Creating src/app directory...
📝 Creating src/app/layout.tsx...
✅ Created layout.tsx
📝 Creating src/app/page.tsx...
✅ Created page.tsx

✅ Router configuration fixed!
```

### Example 2: Port Already In Use

```bash
$ npm run dev

Error: listen EADDRINUSE: address already in use :::3000

📋 Detected: PORT_IN_USE

🤖 Auto-fix available

🔧 Attempting to free port 3000...
✅ Port 3000 freed
   Restart dev server: npm run dev
```

## Workflow Integration

### Git Hooks (Optional)

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run diagnose:quick
if [ $? -ne 0 ]; then
  echo "⚠️  Issues detected. Run 'npm run diagnose' for details."
fi
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Diagnostics
  run: npm run diagnose:auto
  
- name: Check for Critical Issues
  run: |
    if npm run diagnose | grep -q "❌"; then
      echo "Critical issues found!"
      exit 1
    fi
```

## Benefits

| Before | After |
|--------|-------|
| 3 days debugging | 5 minutes with auto-fix |
| Manual error detection | Automatic detection |
| Trial and error | Guided solutions |
| Repeated mistakes | Learned patterns |
| No documentation | Self-documenting |

## Troubleshooting the Troubleshooter

If auto-diagnostics isn't working:

```bash
# Check script permissions
ls -la scripts/

# Make executable
chmod +x scripts/*.sh scripts/*.js

# Test manually
node scripts/auto-diagnose.js

# Check Node version (requires 14+)
node --version
```

## Future Enhancements

- [ ] Machine learning for error prediction
- [ ] Integration with error tracking services
- [ ] Slack/Discord notifications
- [ ] Auto-create GitHub issues
- [ ] Performance monitoring
- [ ] Database health checks
- [ ] API endpoint validation

## Related Documentation

- [Quick Start Guide](QUICK_START.md)
- [Manual Diagnostics](DIAGNOSTIC_SCRIPT.md)
- [Solution Database](solutions/)
- [Contributing](README.md#contributing-new-solutions)
