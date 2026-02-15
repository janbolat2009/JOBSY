# JOBSY
An AI powered app for recruitment.

## 🚀 Production-Safe Code Guidelines

### 1. Never hardcode API addresses
- ❌ `http://localhost:3000/api/...`
- ❌ `http://127.0.0.1:5173/...`
- ❌ `https://my-old-vercel-domain.vercel.app/...`
- ✅ **Use relative paths:** `fetch('/api/resume-analysis/analyze-resume', ...)`
- ✅ **Use environment variables (if necessary):** `const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'`

### 2. Clear separation of Client and Server
- **Client** (.vue, 'use client' components, hooks):
  - NO access to `process.env.OPENAI_API_KEY`, `process.env.SUPABASE_KEY`, etc.
  - Only requests to `/api/...` or public external APIs.
- **Server** (API routes, server actions, logic):
  - Use `process.env.SECRET_NAME` for private keys and sensitive data.

### 3. Environment Variables Naming
| What is stored | Env Name | Client access? | Example |
| :--- | :--- | :--- | :--- |
| Secrets (OpenAI, Supabase private) | `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | No | `process.env.OPENAI_API_KEY` (Server) |
| Public Keys / URLs | `VITE_SUPABASE_URL`, `VITE_PUBLIC_API_URL` | Yes | `import.meta.env.VITE_SUPABASE_URL` |

### 4. Pre-deployment Checks
- `grep -r "localhost" src/` → Should return nothing.
- `grep -r "127.0.0." src/` → Should return nothing.
- `grep -r "http://" src/` → Only for real external public APIs.
- Check browser console for "local network" or "mixed content" warnings.

### 5. Common Pitfalls to Avoid
- `fetch` / `axios` directly in `.vue` files with absolute URLs.
- Importing configs/constants containing `localhost`.
- Leaving old test scripts or dev hooks in production code.
- Copy-pasting code from local projects without cleaning URLs.
