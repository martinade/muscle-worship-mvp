# Troubleshooting Quick Start

## 🚨 Got an Error? Start Here

### Step 1: Run Diagnostics (30 seconds)
```bash
npm run diagnose
```

This will check:
- ✅ Router configuration (App vs Pages)
- ✅ Required files exist
- ✅ Next.js version compatibility
- ✅ Common configuration issues

### Step 2: Identify Your Issue

#### 404 Errors on All Routes
**Symptoms:**
- `GET / 404`
- `GET /?framework=NEXT_JS_APP_ROUTER 404`
- Blank page or "404 Not Found"

**Quick Fix:**
```bash
# Check if you have App Router files
ls src/app/layout.tsx src/app/page.tsx

# If missing, see:
cat docs/troubleshooting/solutions/next-js-pages-vs-app-router-404.md
```

**Time to Fix:** 5 minutes  
**Full Guide:** [Next.js Router Mismatch](solutions/next-js-pages-vs-app-router-404.md)

---

#### 405 Method Not Allowed on Login/Register
**Symptoms:**
- Clicking Login or Register button shows "Method not allowed"
- 405 error in browser console
- API endpoints work with POST but not when clicking links

**Quick Fix:**
```bash
# Check if you're linking directly to API endpoints
grep -r "href=\"/api/" src/pages/

# If found, create proper page routes instead:
# - src/pages/login.tsx (form that POSTs to /api/auth/login)
# - src/pages/register.tsx (form that POSTs to /api/auth/register_fan)
```

**Time to Fix:** 5 minutes  
**Full Guide:** [API Method Not Allowed](solutions/api-method-not-allowed-405.md)

---

#### Import Errors
**Symptoms:**
- `Module not found: Can't resolve '@/...'`
- `Cannot find module '../...'`

**Quick Fix:**
```bash
# Check tsconfig.json paths
cat tsconfig.json | grep -A 5 "paths"

# Verify file exists
ls -la src/[path-to-file]
```

---

#### Dev Server Won't Start
**Symptoms:**
- Port already in use
- Build errors
- Module resolution failures

**Quick Fix:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Clear cache and restart
rm -rf .next
npm run dev
```

---

#### Styling Not Applied
**Symptoms:**
- No styles visible
- Tailwind classes not working
- CSS not loading

**Quick Fix:**
```bash
# Check globals.css import in layout/app
grep -r "globals.css" src/

# Verify Tailwind config
cat tailwind.config.ts
```

---

### Step 3: Search Knowledge Base

```bash
# Search for your error
grep -r "your error message" docs/troubleshooting/solutions/

# List all solutions
ls docs/troubleshooting/solutions/
```

### Step 4: Still Stuck?

1. **Check Recent Changes**
   ```bash
   git diff HEAD~1
   ```

2. **Review Logs**
   ```bash
   # Terminal output
   npm run dev 2>&1 | tee debug.log
   
   # Browser console
   # Open DevTools → Console tab
   ```

3. **Create Issue**
   - Use template: `.github/ISSUE_TEMPLATE/bug_report.md`
   - Include `npm run diagnose` output
   - Attach error logs

---

## Common Commands

```bash
# Full diagnostics
npm run diagnose

# Quick check (errors only)
npm run diagnose:quick

# Restart dev server
npm run dev

# Clear cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Prevention Checklist

Before making changes:
- [ ] Run `npm run diagnose` to establish baseline
- [ ] Commit working code
- [ ] Test in isolation
- [ ] Check diagnostic output after changes

---

## Time-Saving Tips

1. **Always run diagnostics first** - saves hours of debugging
2. **Search knowledge base** - someone likely solved it already
3. **Check git history** - see what changed recently
4. **Use diagnostic script** - automated checks are faster
5. **Document new issues** - help future you and others

---

## Emergency Fixes

### Nuclear Option (Last Resort)
```bash
# Complete reset
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Tempo Platform Issues
```bash
# Restart dev server in Tempo
# Use restartDevServerTool or refresh canvas
```

---

## Getting Help

1. **Documentation:** `docs/troubleshooting/solutions/`
2. **Diagnostics:** `npm run diagnose`
3. **Issue Template:** `.github/ISSUE_TEMPLATE/bug_report.md`
4. **Search:** `grep -r "error" docs/troubleshooting/`

---

**Remember:** Most issues have been solved before. Check the knowledge base first! 🎯
