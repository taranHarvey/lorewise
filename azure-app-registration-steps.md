# Azure App Registration Steps

## Step 1: Create App Registration
1. In Azure portal, click "Create a resource" (blue plus icon)
2. Search for "App registrations"
3. Click "Create"

## Step 2: Configure App Registration
- **Name**: LoreWise Document Editor
- **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
- **Redirect URI**: Leave blank for now

## Step 3: Configure API Permissions
- Go to "API permissions"
- Add Microsoft Graph permissions:
  - Files.ReadWrite
  - User.Read
  - Sites.ReadWrite.All

## Step 4: Create Client Secret
- Go to "Certificates & secrets"
- Create new client secret
- Copy the secret value (save it!)

## Step 5: Get Application ID
- Copy the "Application (client) ID" from Overview
