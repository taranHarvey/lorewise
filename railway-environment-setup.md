# Railway Environment Variables Setup Guide

## Step-by-Step Instructions for Setting Up OnlyOffice Integration

### Step 1: Find Your Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Log in with your GitHub account
3. You should see your LoreWise project with two services:
   - Your **LoreWise app** service
   - Your **OnlyOffice Docker** service

### Step 2: Get Your OnlyOffice URL
1. Click on your **OnlyOffice service** 
2. Find the **"Domains"** section
3. Copy the URL that was generated (something like `https://onlyoffice-production.up.railway.app`)
4. Keep this URL handy - we'll use it in the next steps

### Step 3: Set Environment Variables for LoreWise App

1. Click on your **LoreWise app service** (not the OnlyOffice one)
2. Look for **"Variables"** tab in the dashboard
3. Click **"+ New Variable"**
4. Add these two variables exactly as shown:

#### **Variable 1:**
- **Key:** `ONLYOFFICE_JWT_SECRET`
- **Value:** `QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==`

#### **Variable 2:**
- **Key:** `NEXT_PUBLIC_ONLYOFFICE_SERVER_URL`
- **Value:** `https://your-onlyoffice-url-here.up.railway.app` (replace with your actual URL from Step 2)

### Step 4: Set Environment Variables for OnlyOffice Service

1. Click on your **OnlyOffice service**
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add this variable:

#### **Variable:**
- **Key:** `ONLYOFFICE_JWT_SECRET`
- **Value:** `QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==`

### Step 5: Redeploy Services
After adding the environment variables:
1. Go back to your **LoreWise app service**
2. Click **"Deploy"** or **"Restart"** to apply the new environment variables
3. Wait for both services to fully redeploy

### Step 6: Test the Integration
1. Visit your LoreWise app (the main app URL)
2. Navigate to a document editing page
3. Try opening the OnlyOffice editor
4. Test that changes save properly when you close and reopen documents

## Troubleshooting
- If environment variables don't work, make sure there are no extra spaces or quotes
- Make sure both services are using the same `ONLYOFFICE_JWT_SECRET`
- The `NEXT_PUBLIC_ONLYOFFICE_SERVER_URL` must be the exact OnlyOffice service domain
