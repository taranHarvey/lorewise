# Railway IP Not Visible - Solutions

## Railway often uses dynamic IPs or CDN routing, making direct IP addresses hard to find.

## Alternative Solutions:

### Option 1: Check Railway Networking
- Go to lorewise service → Networking tab → Check for an IP or DNS info section

### Option 2: Use Railway's Domain
- Set up redirect in Railway instead of DNS point
- Let Railway handle subdomain to bare domain conversion

### Option 3: Try the Railway URL directly
- Some Railway services expose underlying IPs in certain locations
- Check if your lorewise service shows actual traffic endpoints
