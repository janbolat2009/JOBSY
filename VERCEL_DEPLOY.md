# JOBSY - Deployment Guide for Vercel

## 🚀 Quick Deploy

### 1. Environment Variables Setup

Go to your Vercel project → **Settings** → **Environment Variables** and add:

#### Required Variables:
```
SUPABASE_URL=https://vieckurggsrjiciuauvo.supabase.co
SUPABASE_SERVICE_KEY=<your_service_role_key>
VITE_SUPABASE_URL=https://vieckurggsrjiciuauvo.supabase.co
VITE_SUPABASE_ANON_KEY=<your_anon_key>
OPENAI_API_KEY=<your_openai_key>
NODE_ENV=production
```

#### How to get keys:

**Supabase Keys:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy `URL` → use as `SUPABASE_URL` and `VITE_SUPABASE_URL`
5. Copy `anon public` key → use as `VITE_SUPABASE_ANON_KEY`
6. Copy `service_role` key (⚠️ SECRET!) → use as `SUPABASE_SERVICE_KEY`

**OpenAI Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy it → use as `OPENAI_API_KEY`

### 2. Deploy

```bash
git add .
git commit -m "Fix Vercel deployment"
git push origin main
```

Vercel will automatically rebuild your app.

### 3. Verify Deployment

After deployment completes, test these endpoints:

1. **Health Check:**
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "supabase": true,
     "openai": true
   }
   ```

2. **If you see `false` values**, check that you've added the environment variables correctly in Vercel Dashboard.

### 4. Check Logs

If errors persist:
1. Go to **Vercel Dashboard** → **Deployments**
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on `api/index` function
5. View **Logs** to see detailed error messages

## ⚠️ Known Limitations on Vercel

- **No Python support** - ML prediction endpoints (`/api/predict/*`) are replaced with JavaScript-based matching
- **10MB request limit** - Large file uploads may fail
- **10 second timeout** - Long-running operations will fail

## 🔧 Troubleshooting

### "Supabase client not initialized"
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in Vercel
- Make sure you're using the `service_role` key, not the `anon` key for backend

### "OpenAI API key not configured"
- Add `OPENAI_API_KEY` to Vercel environment variables
- Make sure the key is valid and has credits

### "FUNCTION_INVOCATION_FAILED"
- Check function logs in Vercel Dashboard
- Usually means a syntax error or missing dependency
- Run `npm install` locally to verify all dependencies install correctly

## 📝 Local Development

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Create .env file based on .env.example
cp .env.example .env

# Add your real keys to .env file

# Run frontend
cd frontend && npm run dev

# Run backend (in a separate terminal)
cd backend && npm run dev
```
