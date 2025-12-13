# API Method Not Allowed (405) - Links to API Endpoints

## Problem Summary

**Error:** `405 Method Not Allowed` when clicking buttons/links that point to API endpoints.

**Symptoms:**
- Clicking "Login" or "Register" buttons shows "Method not allowed"
- Browser shows 405 error
- API endpoints work fine when tested with POST requests via curl/Postman

## Root Cause

HTML `<a>` tags and button links send **GET requests** when clicked. However, API endpoints like `/api/auth/login` or `/api/auth/register_fan` only accept **POST requests**.

**Incorrect Pattern:**
```tsx
// ❌ WRONG - This sends a GET request to an API that expects POST
<a href="/api/auth/login">Login</a>
<a href="/api/auth/register_fan">Register</a>
```

## Solution

Create proper page components with forms that submit POST requests to the API endpoints.

### Step 1: Create Login Page (`src/pages/login.tsx`)

```tsx
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default LoginPage;
```

### Step 2: Create Register Page (`src/pages/register.tsx`)

Similar pattern - create a form that collects user data and submits via POST to `/api/auth/register_fan`.

### Step 3: Update Links on Home Page

```tsx
// ✅ CORRECT - Link to page routes, not API endpoints
<a href="/login">Login</a>
<a href="/register">Register</a>

// Or using Next.js Link component
import Link from "next/link";
<Link href="/login">Login</Link>
<Link href="/register">Register</Link>
```

## Key Principles

| Pattern | Use Case |
|---------|----------|
| `<a href="/page">` | Navigation to pages (GET request) |
| `<form action="/api/..." method="POST">` | Form submission to API |
| `fetch("/api/...", { method: "POST" })` | JavaScript API calls |

## Prevention Checklist

- [ ] Never link directly to API endpoints with `<a>` tags
- [ ] Always create page components for user-facing routes
- [ ] Use forms or fetch() with POST method for API calls
- [ ] API endpoints should return helpful error messages for wrong methods

## Related Files

- `src/pages/login.tsx` - Login page with form
- `src/pages/register.tsx` - Registration page with form
- `src/pages/api/auth/login.ts` - Login API endpoint (POST only)
- `src/pages/api/auth/register_fan.ts` - Registration API endpoint (POST only)

## Time Saved

**Before:** Hours debugging why buttons don't work
**After:** 5 minutes to create proper page routes

---

**Keywords:** 405, method not allowed, GET, POST, API endpoint, login, register, form, link, href
