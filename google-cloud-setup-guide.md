# Google Cloud Setup Guide for LoreWise

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or "New Project"
3. Name it "LoreWise" or similar
4. Click "Create"

## Step 2: Enable Google Docs API
1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Docs API"
3. Click on it and press "Enable"

## Step 3: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name: "lorewise-docs-service"
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

## Step 4: Generate Key
1. Click on your new service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the JSON file

## Step 5: Add to Railway
1. Open the downloaded JSON file
2. Copy the entire contents
3. In Railway, add environment variable:
   - Name: GOOGLE_SERVICE_ACCOUNT_KEY
   - Value: (paste the entire JSON content)
