# Squarespace to Railway DNS Setup

## Current Domain: lorewise.io on Squarespace
## Railway Target: ynbb7icc.up.railway.app

## Setup Steps for Squarespace:

### In Squarespace DNS Settings:
1. **Access your Squarespace Domain Settings**
2. **Remove existing DNS records** for lorewise.io (if any)
3. **Add a CNAME record:**
   - HOST: @ (root domain)
   - TYPE: CNAME
   - VALUE: ynbb7icc.up.railway.app

### OR alternatively (if CNAME doesn't work):
Replace CNAME with A record:
- HOST: @
- TYPE: A
- VALUE: [Railway will provide IP address]

## After DNS change:
- Wait up to 72 hours for propagation
- Railway will verify the connection
- Your lorewise.io will point to your app!
