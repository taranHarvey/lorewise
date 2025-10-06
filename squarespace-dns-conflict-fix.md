# Fix Squarespace DNS Host Conflict

## Error: "This host is already in use by 6 records"
The @ host has existing records - let's resolve this:

## Option 1: Remove existing A/CNAME records for @
1. In Squarespace, **find existing @ records**
2. **Delete all @ records** that might conflict
3. Keep MX, TXT if they're for email
4. Add your new CNAME for @

## Option 2: Use www instead
If removing @ records breaks something:
- **HOST:** `www`
- **TYPE:** `CNAME`  
- **ALIAS DATA:** `ynbb7icc.up.railway.app`

## Option 3: Contact Squarespace Support
If you can't modify the @ host directly
