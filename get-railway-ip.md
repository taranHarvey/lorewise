# Get Railway IP for Bare Domain

## Current Status:
- ✅ www.lorewise.io works (CNAME to ynbb7icc.up.railway.app)
- ❌ lorewise.io doesn't work (CNAME blocked by Squarespace)

## Solution: Use A record with Railway IP

### Step 1: Find Railway IP
1. Go to Railway dashboard
2. Click "lorewise" service 
3. Look in Networking or Overview for IP address
4. Copy the IPv4 address

### Step 2: Add A record in Squarespace
- HOST: @
- TYPE: A  
- DATA: [Railway IP address]

This bypasses CNAME restrictions for bare domains.
