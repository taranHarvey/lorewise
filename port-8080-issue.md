# Port 8080 Issue Found

## Problem:
- Domain: lorewise.io ✅ Connected
- Status: "Waiting for DNS update" ⏳
- Port: 8080 ❌ (Wrong port for web app)

## Issue:
Port 8080 is typically for OnlyOffice, not the main web app.
LoreWise should use port 3000 or standard HTTP port.

## Solutions:
1. Check if this is the OnlyOffice service instead of LoreWise
2. Generate a proper domain for LoreWise service
3. Wait for DNS propagation
