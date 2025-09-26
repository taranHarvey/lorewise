# Vercel + Railway Hybrid Deployment Guide

## 🎯 Strategy Overview

**Vercel** hosts your Next.js app (super fast)
**Railway** hosts OnlyOffice Document Server (with Docker support)

## 💰 Cost Breakdown
- **Vercel**: Free tier (generous limits)
- **Railway**: $5/month for OnlyOffice + Database  
- **Total**: $5/month vs $20+ month for alternative hosting

## 🔧 Setup Process

### Step 1: Deploy Next.js on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your `lorewise` project
3. Vercel auto-detects Next.js configuration
4. Deploy with environment variables for OnlyOffice

### Step 2: Deploy OnlyOffice on Railway
1. Go to [railway.app](https://railway.app)
2. Add "Docker" service with OnlyOffice
3. Configure environment variables for JWT and database

### Step 3: Connect the Services
Set environment variables in Vercel:

```env
# Vercel Environment Variables
NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=https://your-railway-onlyoffice.railway.app
ONLYOFFICE_JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

## ✅ Benefits
- **Global CDN**: Lightning fast worldwide
- **Automatic HTTPS**: Both services  
- **Easy maintenance**: Separate specialized platforms
- **Cost effective**: Only pay for what you use
- **Scalability**: Each service scales independently

## 🔒 Security
- JWT tokens secure communication
- HTTPS for all requests
- Your documents only processed between your services
