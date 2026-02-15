# Production-Safe Code Guidelines

This document outlines the mandatory rules for writing code that is safe for production deployment. Following these rules eliminates 95% of common deployment bugs related to environment configuration and security.

## 1. No Hardcoded API Addresses

**NEVER** hardcode local development addresses or specific staging domains in the source code.

### ❌ Wrong Examples:
```javascript
fetch('http://localhost:3000/api/analyze', ...)
fetch('http://127.0.0.1:5173/api/chat', ...)
fetch('https://some-dev-domain.vercel.app/api/data', ...)
```

### ✅ Correct Examples:

#### A. Use Relative Paths (Preferred)
The most reliable way. The browser will automatically use the current origin.
```javascript
fetch('/api/resume-analysis/analyze-resume', ...)
fetch('/api/chat', ...)
```

#### B. Use Environment Variables
Only if you need to call an API on a different domain or need flexibility.
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
fetch(`${API_BASE}/something`, ...)
```

---

## 2. Separation of Client and Server

Keep a strict boundary between what the browser sees and what the server executes.

### Client-Side (.vue, hooks, components)
- **Safe:** Tracking codes, public keys, API paths.
- **Unsafe:** API Keys (OpenAI, Supabase Service Role), database credentials, private salts.
- **Rule:** If it starts with `process.env`, it is likely NOT available on the client unless prefixed with `VITE_`.

### Server-Side (API Routes, Services)
- **Rule:** This is where you use `process.env.SECRET_KEY`. These files are never sent to the browser.

---

## 3. Environment Variable Naming

| Category | Prefix | Client Visible? | Example |
| :--- | :--- | :--- | :--- |
| **Secrets** | None | ❌ No | `OPENAI_API_KEY` |
| **Public Config** | `VITE_` | ✅ Yes | `VITE_SUPABASE_URL` |

---

## 4. Pre-deployment Verification

Run these commands before pushing to ensure compliance:

```bash
# Should return zero results in src/
grep -r "localhost" src/
grep -r "127.0.0." src/

# Should only show external public APIs
grep -r "http://" src/
```

Check the browser console in your preview environment. If you see "Mixed Content" or "Local Network" warnings, you have a hardcoded URL.

---

## 5. Common Pitfalls

1.  **Direct `fetch` in Components:** Forgetting that `localhost:3000` won't exist in production.
2.  **Shared Constants:** Having a `config.js` that someone modified for local testing and forgot to revert.
3.  **Dev-only Hooks:** Logic that only works when a specific local service is running.
4.  **Copy-Paste:** Bringing logic from a different project that uses a different port or URL structure.
