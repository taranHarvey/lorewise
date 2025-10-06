# OnlyOffice Port Configuration Issue

## Problem:
- OnlyOffice service deployed successfully ✅
- Service responds but shows "Cannot GET /" ❌
- Not serving web interface properly

## Issue:
OnlyOffice Document Server needs specific port configuration for Railway

## Solution:
Check OnlyOffice service networking configuration:
1. Verify port 8080 is exposed
2. Check if service needs port 3000 instead
3. Review OnlyOffice Docker configuration
