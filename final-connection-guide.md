# Final Steps: Connect LoreWise + OnlyOffice

## ✅ Status: Both services deployed
- LoreWise (right card)
- OnlyOffice/documentserver (left card)

## Step 1: Get OnlyOffice URL
Click the "documentserver" card → find Domains section → copy URL

## Step 2: Set Variables on LoreWise
1. Click the "lorewise" card
2. Go to Variables tab
3. Add:
   - NEXT_PUBLIC_ONLYOFFICE_SERVER_URL = (URL from Step 1)
   - ONLYOFFICE_JWT_SECRET = QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==

## Step 3: Set Variables on OnlyOffice  
1. Click the "documentserver" card
2. Go to Variables tab
3. Add:
   - ONLYOFFICE_JWT_SECRET = (same secret as above)
   - JWT_ENABLED = true

## Step 4: Redeploy and Test
- Redeploy both services
- Test document editing in LoreWise
