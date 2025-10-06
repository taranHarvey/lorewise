# OnlyOffice Editor Localhost Error

## Error:
"Editor failed to load"
"Ensure OnlyOffice server is running on localhost:8080"

## Issue:
The app is trying to connect to localhost:8080 instead of the deployed OnlyOffice service.

## Cause:
Environment variable NEXT_PUBLIC_ONLYOFFICE_SERVER_URL not set correctly in Railway.

## Solution:
Add environment variable to Railway LoreWise service:
- Name: NEXT_PUBLIC_ONLYOFFICE_SERVER_URL
- Value: https://onlyofficedocumentserverlatest-production.up.railway.app
