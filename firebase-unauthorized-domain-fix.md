# Firebase Unauthorized Domain Fix

## Error:
"Firebase: Error (auth/unauthorized-domain)"

## Cause:
Firebase only allows authentication from pre-approved domains.
Your Railway URL isn't in the Firebase authorized domains list.

## Solution:
Add your Railway URL to Firebase Console:
1. Go to Firebase Console
2. Select your project
3. Authentication → Settings → Authorized domains
4. Add your Railway URL (e.g., https://lorewise-production.up.railway.app)

## Also add for later:
- https://www.lorewise.io
- https://lorewise.io
