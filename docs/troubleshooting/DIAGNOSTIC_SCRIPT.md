# Automated Diagnostic Script

This document provides scripts to quickly diagnose common issues.

## Quick Diagnostic Script

Create this file as `scripts/diagnose.sh`:

```bash
#!/bin/bash

echo "🔍 Running Project Diagnostics..."
echo "=================================="
echo ""

# Check Next.js Router Type
echo "📁 Checking Next.js Router Configuration..."
if [ -d "src/app" ]; then
    echo "✅ App Router detected (src/app/)"
    if [ -f "src/app/layout.tsx" ]; then
        echo "   ✅ layout.tsx exists"
    else
        echo "   ❌ layout.tsx MISSING - This will cause 404 errors!"
    fi
    if [ -f "src/app/page.tsx" ]; then
        echo "   ✅ page.tsx exists"
    else
        echo "   ❌ page.tsx MISSING - This will cause 404 errors!"
    fi
fi

if [ -d "src/pages" ]; then
    echo "✅ Pages Router detected (src/pages/)"
    if [ -f "src/pages/_app.tsx" ]; then
        echo "   ✅ _app.tsx exists"
    fi
    if [ -f "src/pages/index.tsx" ]; then
        echo "   ✅ index.tsx exists"
    fi
fi

if [ -d "src/app" ] && [ -d "src/pages" ]; then
    echo "⚠️  WARNING: Both routers detected - ensure next.config.js is configured correctly"
fi

echo ""

# Check Tempo Configuration
echo "🎯 Checking Tempo Configuration..."
if [ -f "tempo.config.json" ]; then
    echo "✅ tempo.config.json exists"
else
    echo "⚠️  tempo.config.json not found"
fi

echo ""

# Check Next.js Configuration
echo "⚙️  Checking next.config.js..."
if [ -f "next.config.js" ]; then
    echo "✅ next.config.js exists"
    if grep -q "pageExtensions" next.config.js; then
        echo "   ✅ pageExtensions configured"
    else
        echo "   ⚠️  pageExtensions not set (may cause issues with hybrid routing)"
    fi
else
    echo "❌ next.config.js MISSING"
fi

echo ""

# Check Dependencies
echo "📦 Checking Dependencies..."
if [ -f "package.json" ]; then
    NEXT_VERSION=$(grep '"next"' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
    echo "   Next.js version: $NEXT_VERSION"
    
    if [[ "$NEXT_VERSION" == *"13"* ]] || [[ "$NEXT_VERSION" == *"14"* ]] || [[ "$NEXT_VERSION" == *"15"* ]]; then
        echo "   ✅ Next.js 13+ (App Router supported)"
    else
        echo "   ⚠️  Next.js <13 (App Router not available)"
    fi
fi

echo ""

# Check for Common Issues
echo "🔎 Checking for Common Issues..."

# Check for incorrect imports
if grep -r "@/styles" src/pages/_app.tsx 2>/dev/null | grep -q "globals.css"; then
    echo "   ✅ Global styles import looks correct"
else
    if [ -f "src/pages/_app.tsx" ]; then
        echo "   ⚠️  Check global styles import in _app.tsx"
    fi
fi

# Check for missing directories
if [ ! -d "src/styles" ]; then
    echo "   ❌ src/styles directory MISSING"
fi

if [ ! -f "src/styles/globals.css" ]; then
    echo "   ❌ src/styles/globals.css MISSING"
fi

echo ""

# Check Recent Errors in Logs
echo "📋 Recent Errors (if any)..."
if [ -f ".next/trace" ]; then
    echo "   Checking build traces..."
fi

# Summary
echo ""
echo "=================================="
echo "✅ Diagnostic Complete"
echo ""
echo "💡 If you see any ❌ or ⚠️  above, check:"
echo "   docs/troubleshooting/solutions/"
echo ""
echo "🔍 For 404 errors, see:"
echo "   docs/troubleshooting/solutions/next-js-pages-vs-app-router-404.md"
echo ""
```

## Usage

### Make Script Executable
```bash
chmod +x scripts/diagnose.sh
```

### Run Diagnostics
```bash
./scripts/diagnose.sh
```

### Add to package.json
```json
{
  "scripts": {
    "diagnose": "bash scripts/diagnose.sh",
    "diagnose:quick": "bash scripts/diagnose.sh | grep -E '❌|⚠️'"
  }
}
```

## Quick Checks (Manual)

### Check Router Type
```bash
# App Router
ls -la src/app/layout.tsx src/app/page.tsx

# Pages Router  
ls -la src/pages/_app.tsx src/pages/index.tsx
```

### Check for 404 Patterns
```bash
# In terminal logs
grep "404" .next/trace

# In browser console
# Look for: GET / 404
# Look for: GET /?framework=NEXT_JS_APP_ROUTER 404
```

### Verify Configuration
```bash
# Check Next.js config
cat next.config.js | grep -A 5 "pageExtensions"

# Check TypeScript paths
cat tsconfig.json | grep -A 10 "paths"
```

## Automated Fix Suggestions

Based on diagnostic results, the script can suggest:

```bash
# If App Router files missing
echo "Run: mkdir -p src/app && touch src/app/layout.tsx src/app/page.tsx"

# If Pages Router files missing  
echo "Run: mkdir -p src/pages && touch src/pages/_app.tsx src/pages/index.tsx"

# If both exist but 404s persist
echo "Check: docs/troubleshooting/solutions/next-js-pages-vs-app-router-404.md"
```

## Integration with CI/CD

Add to GitHub Actions or similar:

```yaml
- name: Run Diagnostics
  run: npm run diagnose
  
- name: Check for Critical Issues
  run: |
    if npm run diagnose | grep -q "❌"; then
      echo "Critical issues found!"
      exit 1
    fi
```

## Future Enhancements

- [ ] Add database connection checks
- [ ] Add API endpoint validation
- [ ] Add environment variable verification
- [ ] Add Supabase connection test
- [ ] Add Stripe webhook validation
- [ ] Generate diagnostic report as JSON
- [ ] Auto-fix common issues with user confirmation
