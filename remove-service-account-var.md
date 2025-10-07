# Remove Old Service Account Variable

## Issue:
The code is still trying to use the old service account approach, causing "client_email" errors.

## Solution:
Remove the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable from Railway since we're now using OAuth2.

## Steps:
1. Go to Railway → LoreWise service → Variables
2. Delete the `GOOGLE_SERVICE_ACCOUNT_KEY` variable
3. Keep only these OAuth2 variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET` 
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Result:
After removing the service account variable, the OAuth2 flow should work properly.
