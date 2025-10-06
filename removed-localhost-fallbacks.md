# Removed Localhost Fallbacks

## Changes Made:
1. **next.config.ts**: Removed localhost:8080 fallback
2. **OnlyOfficeEditor.tsx**: Removed localhost:8080 fallback
3. **Added proper error handling**: Clear error if environment variable not set

## Benefits:
- No more localhost confusion for production users
- Clear error messages if OnlyOffice URL not configured
- Forces proper environment variable setup

## Result:
App will now only use the configured OnlyOffice server URL or show a clear error.
