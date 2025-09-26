# Step-by-Step Railway Setup with Screenshot Guidance

## Step 1: Open Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. You should see your project dashboard
3. You'll have **two services** listed:
   - [ ] Your Next.js app (LoreWise)
   - [ ] Docker service (OnlyOffice)

## Step 2: Identify OnlyOffice URL
1. Click on your **Docker service** (roughly named like "Docker" or "onlyoffice")
2. Look for "Overview" tab
3. Find the **"Domains"** section
4. Click the **copy button** next to the domain (like https://xxxxx.up.railway.app)
5. Save this URL somewhere - we need it in 5 minutes

## Step 3: Configure LoreWise Environment
1. Click back to your **main Next.js app service** 
2. Look for the **"Variables"** tab (next to "Metrics", "Logs")
3. Click **"+ New Variable"**  
4. Add variable pair by pair:

### Variable 1:
**Name:** `ONLYOFFICE_JWT_SECRET`
**Value:** `QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==`
Click **"Add"**

### Variable 2:
**Name:** `NEXT_PUBLIC_ONLYOFFICE_SERVER_URL` 
**Value:** (paste URL from Step 2)
Click **"Add"**

After adding both variables, click **"Deploy"** or it auto-refreshes.

## Step 4: Configure OnlyOffice
1. Click on **OnlyOffice Docker service**
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:

**Name:** `ONLYOFFICE_JWT_SECRET`
**Value:** `QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==`
Click **"Add"**

Click **"Deploy"** on the OnlyOffice service too.

## What Each Variable Does
- **`ONLYOFFICE_JWT_SECRET`:** Like a password both services share
- **`NEXT_PUBLIC_ONLYOFFICE_SERVER_URL`:** Tells LoreWise where OnlyOffice lives
