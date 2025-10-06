# OnlyOffice 502 Bad Gateway Error

## Error:
"Application failed to respond" - 502 Bad Gateway

## Issue:
OnlyOffice service is crashing or not starting properly on port 8080

## Possible Causes:
1. OnlyOffice doesn't support port 8080 on Railway
2. Service needs specific environment variables
3. Docker configuration issue
4. Port conflict

## Solutions:
1. Check OnlyOffice service logs in Railway
2. Try port 3000 instead of 8080
3. Verify OnlyOffice environment variables
4. Check if service is actually running
