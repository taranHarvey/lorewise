# Google Docs Credentials Needed

## Issue:
"Failed to create Google Doc" error - integration is working but credentials missing

## Solution:
Add the Google Service Account JSON to Railway environment variables

## Steps:
1. Open the downloaded JSON file from Google Cloud
2. Copy the entire contents
3. Go to Railway → LoreWise service → Variables
4. Add environment variable:
   - Name: GOOGLE_SERVICE_ACCOUNT_KEY
   - Value: (paste entire JSON content)

## Expected Result:
After adding credentials and redeploy, Google Docs should create successfully
