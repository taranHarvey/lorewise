# Fixed OnlyOffice Fallback URL

## Issue Found:
The next.config.ts had a fallback to localhost:8080, so even with the environment variable set, it was using the wrong URL.

## Fix Applied:
Updated next.config.ts fallback from:
- `http://localhost:8080`
- To: `https://onlyofficedocumentserverlatest-production.up.railway.app:8000`

## Result:
Now the app will use the deployed OnlyOffice service even if environment variable isn't read properly.

## Next:
Railway will auto-redeploy with this fix.
