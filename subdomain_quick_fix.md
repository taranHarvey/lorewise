# Subdomain CNAME Fix (Recommended)

## Use these exact fields for www:
- HOST: `www`
- TYPE: `CNAME`
- DATA: `ynbb7icc.up.railway.app`

## Result:
- www.lorewise.io → Railway app (working)
- Users can type lorewise.io or www.lorewise.io - both work
- Railway still receives DNS intent correctly

## Next if www succeeds but you want bare domain:
- Contact Squarespace support for @-level routing (e.g., "It's for a CNAME to a hosting platform\(-\)what's blocking me here?")
   - You'll use guidance for canonical name handling  
     - They may explain policy regarding A records vs CNAME translations
     - You'll fill in any additional record requirements (txt, mx et c.) as needed
