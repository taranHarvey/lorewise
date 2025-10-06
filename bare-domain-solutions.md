# Option A: Railway IPs (A Record)
1. Open Railway dashboard
2. Go to project → lorewise service
3. Networking tab → either an option "Get DNS Details" or a primary IP should be visible
4. Using your SquareDNS tool add:
   - HOST: @
   - TYPE: A
   - DATA: (whatever IP or ones Railway gives you)

# Option B: Railway custom domain redirect (Railway side)
1. At Railway “Custom Domains” (under campaign domain of lorewise.io)
2. Authorize preview routes for browser:
   - You may see something like “lorewise.io” listed if it’s already mapped (or enter manually)
     - Railroad should then realize it owns a primary and redirect internally
     - Nevertheless, keep www DNS record pointing to ynbb7icc.up.railway.app
3. This allows Railway to manage subdomain and same-based domains cleanly and handle “lorewise.io → www.lorewise.io” redirect on server-side

# Option C: Alternative DNS destinations
ระหว่าง …
```
The most practicable option is implementation on the platform (avoid entirely manual DNS records and recompile into such routes in Railway or Pulumi manifest.yml or in Next.js redirect.
```).
