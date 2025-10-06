# OnlyOffice Port 8000 is Correct

## ✅ Keep OnlyOffice on port 8000:
- Logs show: "Express server listening on port 8000"
- All services started successfully on port 8000
- OnlyOffice is working properly on this port

## ❌ Don't change to 8080:
- Port 8080 caused 502 errors
- OnlyOffice doesn't run properly on 8080
- The service is designed for port 8000

## Action needed:
Update LoreWise environment variable to point to port 8000:
https://onlyofficedocumentserverlatest-production.up.railway.app:8000
