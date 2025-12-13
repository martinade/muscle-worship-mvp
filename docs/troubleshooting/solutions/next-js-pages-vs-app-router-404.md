# Next.js Pages Router vs App Router 404 Error

## Problem Summary
Application returning 404 errors for all routes when deployed in Tempo platform, despite having valid page files in `src/pages/` directory.

## Error Symptoms
```
GET / 404 in 439ms
GET /?framework=NEXT_JS_APP_ROUTER 404 in 6ms
GET /_next/static/css/app/layout.css?v=1764922359154 404 in 10ms
GET /_next/static/media/e4af272ccee01ff0-s.p.woff2 404 in 11ms
```

## Root Cause
**Mismatch between Tempo platform configuration and project structure:**
- Tempo platform was configured for `NEXT_JS_APP_ROUTER`
- Project was using Next.js **Pages Router** (files in `src/pages/`)
- Next.js was looking for App Router files (`src/app/layout.tsx`, `src/app/page.tsx`) which didn't exist
- All requests resulted in 404 because no valid routes were found in the expected location

## Technical Details

### Pages Router Structure (What existed)
```
src/
  pages/
    _app.tsx
    _document.tsx
    index.tsx
    api/
```

### App Router Structure (What Tempo expected)
```
src/
  app/
    layout.tsx
    page.tsx
```

### Key Differences
| Pages Router | App Router |
|--------------|------------|
| `pages/_app.tsx` | `app/layout.tsx` |
| `pages/index.tsx` | `app/page.tsx` |
| File-based routing in `pages/` | File-based routing in `app/` |
| Next.js 12 and earlier default | Next.js 13+ default |

## Solution Applied

### Step 1: Created App Router Layout
**File:** `src/app/layout.tsx`
```tsx
import "@/styles/globals.css";

export const metadata = {
  title: "Muscle Worship Platform",
  description: "Muscle Worship Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 2: Created App Router Home Page
**File:** `src/app/page.tsx`
```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Page content */}
    </main>
  );
}
```

### Step 3: Created Login and Register Pages
**Files:** 
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

Both pages use `"use client"` directive for client-side interactivity.

### Step 4: Restarted Dev Server
Used `restartDevServerTool` to apply changes.

## Prevention Strategy

### Immediate Diagnostic Checklist
When encountering 404 errors in Tempo:

1. **Check Tempo Configuration**
   ```bash
   # Look for framework configuration in tempo.config.json or platform settings
   grep -r "NEXT_JS_APP_ROUTER\|NEXT_JS_PAGES_ROUTER" .
   ```

2. **Verify Project Structure**
   ```bash
   # Check which router is being used
   ls -la src/pages/     # Pages Router
   ls -la src/app/       # App Router
   ```

3. **Check Next.js Version**
   ```bash
   # In package.json
   grep "next" package.json
   ```

4. **Inspect Dev Server Logs**
   - Look for `GET /?framework=NEXT_JS_APP_ROUTER` in logs
   - Check for missing layout.css or font files from `/_next/static/`

### Quick Fix Decision Tree

```
404 Errors on All Routes?
│
├─ Check: Does src/app/ exist?
│  ├─ NO → Platform expects App Router
│  │      → Create src/app/layout.tsx and src/app/page.tsx
│  │
│  └─ YES → Check: Does src/pages/ exist?
│           ├─ YES → Hybrid setup, check next.config.js pageExtensions
│           └─ NO → Check file naming and exports
│
└─ Check: Tempo platform configuration
   └─ Ensure framework setting matches project structure
```

## Files Modified/Created

### Created
- `src/app/layout.tsx` - Root layout with global styles
- `src/app/page.tsx` - Home page
- `src/app/login/page.tsx` - Login page with form
- `src/app/register/page.tsx` - Registration page with form

### Modified
- `next.config.js` - Added `pageExtensions` configuration
- `src/pages/_app.tsx` - Fixed import path for globals.css

## Testing Verification

After fix:
1. ✅ Home page loads at `/`
2. ✅ Login page accessible at `/login`
3. ✅ Register page accessible at `/register`
4. ✅ No 404 errors in console
5. ✅ Static assets loading correctly

## Related Issues
- Import path resolution (`@/` vs relative paths)
- Dev server not picking up new files (requires restart)
- Fast Refresh full reload warnings

## References
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Migrating from Pages to App Router](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)

## Time to Resolution
- Initial issue: 3 days
- With this guide: ~5 minutes

## Keywords
`404`, `Next.js`, `App Router`, `Pages Router`, `Tempo`, `routing`, `not found`, `layout.tsx`, `page.tsx`
