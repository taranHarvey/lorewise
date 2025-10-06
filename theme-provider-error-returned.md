# ThemeProvider SSG Error Returned

## Error: 
```
Error: useTheme must be used within a ThemeProvider
at /dashboard/settings page
```

## Issue:
Our previous ThemeProvider fix didn't deploy or got reverted.

## Solution:
Need to redeploy our SSG-safe ThemeProvider changes.

## Files to check:
- src/components/theme/ThemeProvider.tsx
- src/app/dashboard/settings/page.tsx
- next.config.ts (ESLint/TypeScript bypass)
