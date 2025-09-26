# Firebase Setup Guide for LoreWise

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `lorewise` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Web App

1. In your Firebase project, click the web icon (`</>`)
2. Register your app with nickname: `LoreWise Web`
3. **Don't** check "Also set up Firebase Hosting" (we're using Vercel)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

## Step 4: Configure Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 5: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 6: Test the Setup

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Scroll down to the "Database Test" section
4. Click "Create Test Novel" to test Firestore connection
5. Click "Get Novels" to verify data retrieval

## Step 7: Set Up Security Rules (Later)

We'll add proper security rules once we implement authentication. For now, test mode allows all reads/writes.

## Troubleshooting

- **"Firebase: Error (auth/configuration-not-found)"**: Check your environment variables
- **"Permission denied"**: Make sure Firestore is in test mode
- **"Network error"**: Check your internet connection and Firebase project status

## Next Steps

Once Firebase is working:
1. ✅ Database setup complete
2. 🔄 Authentication setup
3. 🔄 AI integration
4. 🔄 Writing interface
