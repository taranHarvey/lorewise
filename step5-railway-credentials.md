# Step 5: Add Credentials to Railway

## Open the JSON File:
1. **Open the downloaded JSON file** (should be named something like `lorewise-docs-service-xxxxx.json`)
2. **Copy the entire contents** of the file (Ctrl+A, Ctrl+C)

## Add to Railway:
1. **Go to Railway dashboard**
2. **Click on your "lorewise" service** (not OnlyOffice)
3. **Go to "Variables" tab**
4. **Click "+ New Variable"**
5. **Add the environment variable:**
   - **Name:** `GOOGLE_SERVICE_ACCOUNT_KEY`
   - **Value:** (paste the entire JSON content)
6. **Click "Add"**

## Verify:
- The variable should appear in your environment variables list
- Railway will automatically redeploy your app

## Test:
Once redeployed, try creating/editing a document in LoreWise!
