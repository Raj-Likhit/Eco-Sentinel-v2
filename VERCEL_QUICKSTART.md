# Vercel Deployment Quick Start

## 5-Minute Setup

### Step 1: Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Set Root Directory to `frontend`
5. Click Deploy

### Step 2: Deploy Backend

Choose one platform:

**Railway (Easiest)**
```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

**Render**
- Go to https://render.com
- Create Web Service from GitHub
- Set Root Directory to `backend`
- Deploy

### Step 3: Deploy Python Service (Optional)

If you need satellite analysis:

**Railway**
```bash
cd backend/gee-service
railway init
railway up
```

### Step 4: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
PYTHON_SERVICE_URL=https://your-python-service-url.com
GOOGLE_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@ecosentinel.com
AUTHORITY_EMAIL=authority@example.com
```

### Step 5: Test

Visit your Vercel deployment URL and test the application.

## Common Issues

**Build fails?**
- Check `frontend/package.json` has all dependencies
- Verify Node.js version is 18+

**API calls fail?**
- Verify `NEXT_PUBLIC_API_URL` is set
- Check backend is running
- Verify CORS is enabled in backend

**Email not working?**
- Use Gmail app password (not regular password)
- Verify SMTP credentials

## Full Documentation

See `VERCEL_DEPLOYMENT.md` for detailed instructions.
