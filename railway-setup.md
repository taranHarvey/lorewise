# Railway Deployment Guide for LoreWise + OnlyOffice

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

## Step 2: Deploy Your Next.js App (LoreWise)
1. **Import your GitHub repo** to Railway
2. **Auto-deploys** from your repository
3. Railway gives you: `https://lorewise-production.up.railway.app`

## Step 3: Deploy OnlyOffice Document Server 
1. **Add new service** to same Railway project
2. **Select "Docker" deployment option**
3. Use this deployment URL for OnlyOffice setting in your app
4. Railway gives you: `https://lorewise-onlyoffice-production.up.railway.app`

## Step 4: Railway Configuration Files Needed

Create `railway.toml` in project root:
```toml
[build]
builder = "nixpacks"

[deploy]
[[deploy.services]]
source = "."
```

## Step 5: Environment Variables on Railway
Set these in Railway dashboard:
- `NEXT_PUBLIC_APP_URL=https://lorewise-production.up.railway.app`
- `NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=https://lorewise-onlyoffice-production.up.railway.app`
- Add all Firebase environment variables from your current setup
- Add JWT secrets for OnlyOffice

## Benefits:
✅ **$5/month starts** for both services
✅ **Simple dashboard** to manage both 
✅ **Automatic HTTPS** for both services  
✅ **Built-in monitoring** and logs
✅ **Easy environment variable** management
✅ **GitHub integration** for automatic deployments
