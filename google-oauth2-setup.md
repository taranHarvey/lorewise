# Google OAuth2 Setup for Individual User Accounts

## Why OAuth2 is Better:
- ✅ **Security**: Each user's documents stay in their own Google account
- ✅ **Privacy**: Users can access their documents directly in Google Drive
- ✅ **Simplicity**: No complex domain-wide delegation needed
- ✅ **User Control**: Users can revoke access anytime

## Setup Steps:

### 1. Create OAuth2 Credentials
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "LoreWise OAuth2"
5. Authorized redirect URIs: `https://your-railway-url.com/api/auth/google/callback`

### 2. Get Credentials
- Copy the Client ID and Client Secret
- Add to Railway environment variables:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI` (your callback URL)

### 3. User Flow
1. User clicks "Connect Google Docs"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Google redirects back with access token
5. LoreWise stores token and can create/access user's docs

## Benefits:
- Documents belong to users, not service account
- Users can access docs directly in Google Drive
- Better security and privacy
- No admin setup required
