# Vercel Deployment Guide

This guide explains how to deploy Eco-Sentinel to Vercel.

## Architecture Overview

Eco-Sentinel uses a distributed architecture:

- **Frontend**: Next.js 14 application (deployed on Vercel)
- **Backend**: Express.js API (must be deployed separately)
- **Python Services**: GEE satellite analysis (must be deployed separately)

Vercel only supports Node.js, so Python services must be hosted elsewhere.

## Deployment Strategy

### 1. Frontend Deployment (Vercel)

The frontend is a Next.js application that can be deployed directly to Vercel.

#### Prerequisites
- Vercel account (https://vercel.com)
- GitHub/GitLab/Bitbucket repository with this code

#### Steps

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/new
   - Select your Git provider and authorize
   - Select the `Eco-Sentinel-Raj-dev` repository
   - Click "Import"

2. **Configure Build Settings**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build --workspace=frontend`
   - Output Directory: `frontend/.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.example`:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-domain.com
     PYTHON_SERVICE_URL=https://your-python-service.com
     GOOGLE_API_KEY=your_key
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email
     SMTP_PASS=your_password
     SMTP_FROM=noreply@ecosentinel.com
     AUTHORITY_EMAIL=authority@example.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy on every push to main

### 2. Backend Deployment (Express.js)

The Express.js backend must be deployed separately. Options include:

#### Option A: Railway (Recommended)
1. Go to https://railway.app
2. Create new project → Deploy from GitHub
3. Select the repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add environment variables (same as `.env.example`)
6. Deploy

#### Option B: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

#### Option C: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly launch` in the `backend` directory
3. Configure `fly.toml` with environment variables
4. Deploy: `fly deploy`

### 3. Python Services Deployment

The Python GEE service must be deployed separately. Options include:

#### Option A: Railway
1. Create new project on Railway
2. Deploy from GitHub
3. Configure:
   - Root Directory: `backend/gee-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
4. Add environment variables
5. Deploy

#### Option B: Render
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Root Directory: `backend/gee-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
4. Deploy

#### Option C: Google Cloud Run
1. Build Docker image: `docker build -f backend/Dockerfile -t gee-service .`
2. Push to Google Container Registry
3. Deploy to Cloud Run

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |
| `PYTHON_SERVICE_URL` | Python service URL | `https://python-service.example.com` |
| `GOOGLE_API_KEY` | Google Generative AI key | `sk-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email account | `your@gmail.com` |
| `SMTP_PASS` | Email password/app password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Sender email address | `noreply@ecosentinel.com` |
| `AUTHORITY_EMAIL` | Authority notification email | `authority@example.com` |

## Deployment Checklist

- [ ] Frontend repository connected to Vercel
- [ ] Build settings configured correctly
- [ ] All environment variables set in Vercel
- [ ] Backend deployed to Railway/Render/Fly.io
- [ ] Backend environment variables configured
- [ ] Python service deployed
- [ ] Python service environment variables configured
- [ ] `NEXT_PUBLIC_API_URL` points to deployed backend
- [ ] `PYTHON_SERVICE_URL` points to deployed Python service
- [ ] Test API calls from frontend to backend
- [ ] Test email alerts functionality
- [ ] Monitor logs for errors

## Troubleshooting

### Build Fails on Vercel
- Check that `frontend/package.json` has all dependencies
- Verify `next.config.js` is valid
- Check build logs in Vercel dashboard

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration in backend
- Verify backend is running and accessible

### Email Alerts Not Working
- Verify SMTP credentials are correct
- Check that Gmail app password is used (not regular password)
- Verify `SMTP_FROM` and `AUTHORITY_EMAIL` are valid

### Python Service Errors
- Check Python service logs
- Verify all Python dependencies are installed
- Verify environment variables are set

## Local Development

For local development, use the default environment variables:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Python Service (if needed)
cd backend/gee-service
pip install -r requirements.txt
python app.py

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:7475`
Backend will be available at `http://localhost:8000`
Python service will be available at `http://localhost:5000`

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
