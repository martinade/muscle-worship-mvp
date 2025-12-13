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
        echo "      Fix: Create src/app/layout.tsx"
    fi
    if [ -f "src/app/page.tsx" ]; then
        echo "   ✅ page.tsx exists"
    else
        echo "   ❌ page.tsx MISSING - This will cause 404 errors!"
        echo "      Fix: Create src/app/page.tsx"
    fi
else
    echo "⚠️  App Router NOT detected (src/app/ missing)"
fi

if [ -d "src/pages" ]; then
    echo "✅ Pages Router detected (src/pages/)"
    if [ -f "src/pages/_app.tsx" ]; then
        echo "   ✅ _app.tsx exists"
    fi
    if [ -f "src/pages/index.tsx" ]; then
        echo "   ✅ index.tsx exists"
    fi
else
    echo "⚠️  Pages Router NOT detected (src/pages/ missing)"
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
if [ -f "src/pages/_app.tsx" ]; then
    if grep -q "@/styles/globals.css" src/pages/_app.tsx; then
        echo "   ✅ Global styles import uses path alias"
    elif grep -q "../styles/globals.css" src/pages/_app.tsx; then
        echo "   ✅ Global styles import uses relative path"
    else
        echo "   ⚠️  Check global styles import in _app.tsx"
    fi
fi

# Check for missing directories
if [ ! -d "src/styles" ]; then
    echo "   ❌ src/styles directory MISSING"
else
    echo "   ✅ src/styles directory exists"
fi

if [ ! -f "src/styles/globals.css" ]; then
    echo "   ❌ src/styles/globals.css MISSING"
else
    echo "   ✅ src/styles/globals.css exists"
fi

echo ""

# Summary
echo "=================================="
echo "✅ Diagnostic Complete"
echo ""
echo "💡 If you see any ❌ or ⚠️  above, check:"
echo "   docs/troubleshooting/solutions/"
echo ""
echo "🔍 For 404 errors, see:"
echo "   docs/troubleshooting/solutions/next-js-pages-vs-app-router-404.md"
echo ""
