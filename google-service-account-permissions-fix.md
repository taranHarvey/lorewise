# Fix Google Service Account Permissions

## Issue:
"The caller does not have permission" error - Service Account needs proper permissions

## Solution:
Enable domain-wide delegation and add proper scopes

## Steps:

### 1. Enable Domain-Wide Delegation
1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Click on your service account (lorewise-service-account)
3. Click "Edit" (pencil icon)
4. Check "Enable Google Workspace Domain-wide Delegation"
5. Click "Save"

### 2. Add OAuth Scopes
1. In the same service account page, click "Advanced settings"
2. Under "Domain-wide delegation", click "Add new"
3. Add these OAuth scopes:
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/drive.file`
4. Click "Authorize"

### 3. Alternative: Use Drive API Scope
The Google Docs API requires Drive permissions to create documents. Update the scopes in the code.

## Expected Result:
After enabling domain-wide delegation, Google Docs should create successfully
