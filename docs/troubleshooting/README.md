# Troubleshooting Knowledge Base

This directory contains solutions to common issues encountered during development. Each solution is documented with problem symptoms, root causes, and step-by-step fixes.

## 🤖 Automated System

**NEW:** This project now has automated diagnostics!

```bash
# Start dev server with auto-diagnostics
npm run dev:watch

# Auto-detect and fix issues
npm run diagnose:auto

# Auto-fix router issues
npm run fix:router
```

See [Auto-Diagnostics Guide](AUTO_DIAGNOSTICS.md) for details.

## Quick Reference

### Navigation by Error Type

| Error Type | Document | Auto-Fix | Time Saved |
|------------|----------|----------|------------|
| 404 on all routes | [Next.js Router Mismatch](solutions/next-js-pages-vs-app-router-404.md) | ✅ Yes | 3 days → 5 min |
| 405 Method Not Allowed | [API Method Not Allowed](solutions/api-method-not-allowed-405.md) | ❌ No | Hours → 5 min |

### Navigation by Technology

#### Next.js
- [Pages Router vs App Router 404 Errors](solutions/next-js-pages-vs-app-router-404.md)
- [API Method Not Allowed 405 Errors](solutions/api-method-not-allowed-405.md)

#### Tempo Platform
- [Pages Router vs App Router 404 Errors](solutions/next-js-pages-vs-app-router-404.md)

#### API Routes
- [API Method Not Allowed 405 Errors](solutions/api-method-not-allowed-405.md)

## How to Use This Knowledge Base

### When You Encounter an Error

1. **Check the error message** in your console/logs
2. **Search this directory** for keywords from your error
3. **Follow the diagnostic checklist** in the relevant document
4. **Apply the solution** step-by-step
5. **Verify the fix** using the testing section

### Quick Search Commands

```bash
# Search all solutions for a keyword
grep -r "404" docs/troubleshooting/solutions/

# Search for specific error messages
grep -r "GET / 404" docs/troubleshooting/solutions/

# List all solution files
ls -la docs/troubleshooting/solutions/
```

## Document Structure

Each solution document follows this template:

```markdown
# [Problem Title]

## Problem Summary
Brief description of the issue

## Error Symptoms
Actual error messages and logs

## Root Cause
Technical explanation of why it happened

## Solution Applied
Step-by-step fix with code examples

## Prevention Strategy
How to avoid this in the future

## Testing Verification
How to confirm the fix worked

## Time to Resolution
Before and after using this guide
```

## Contributing New Solutions

When you encounter and solve a new issue:

1. Create a new file in `solutions/` with a descriptive name
2. Use kebab-case: `problem-description.md`
3. Follow the template structure above
4. Add entry to this README in the Quick Reference tables
5. Include relevant keywords for searchability

### Naming Convention

```
[technology]-[component]-[error-type].md

Examples:
- next-js-pages-vs-app-router-404.md
- supabase-auth-token-expired.md
- stripe-webhook-signature-invalid.md
```

## Diagnostic Tools

### Built-in Checks

Create a diagnostic script for common issues:

```bash
# Run comprehensive diagnostics
npm run diagnose

# Check specific subsystem
npm run diagnose:routing
npm run diagnose:auth
npm run diagnose:database
```

### Log Analysis

```bash
# Extract errors from logs
grep -i "error\|404\|500" logs/*.log

# Find recent issues
tail -f logs/dev.log | grep -i "error"
```

## Priority Levels

Solutions are categorized by impact:

- 🔴 **Critical**: Blocks all development (e.g., 404 on all routes)
- 🟡 **High**: Blocks specific features
- 🟢 **Medium**: Workaround available
- 🔵 **Low**: Minor inconvenience

## Maintenance

This knowledge base should be:
- ✅ Updated when new issues are resolved
- ✅ Reviewed quarterly for outdated solutions
- ✅ Cross-referenced with official documentation
- ✅ Searchable and well-organized

## Related Resources

- [Project Setup Documentation](../setup/)
- [Testing Documentation](../testing/)
- [API Documentation](../api/)

---

**Last Updated:** 2024-01-04  
**Total Solutions:** 2  
**Total Time Saved:** ~3 days per occurrence
