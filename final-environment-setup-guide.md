# Final Setup: Connect LoreWise + OnlyOffice

## ✅ OnlyOffice URL Available
https://onlyofficedocumentserverlatest-production.up.railway.app

## 🔧 Environment Variables Setup

### Step 1: Configure LoreWise App
Click on the "lorewise" service card:
1. Go to "Variables" tab
2. Add Environment Variables:
   
   **Variable 1:**
   - Name: `NEXT_PUBLIC_ONLYOFFICE_SERVER_URL`
   - Value: `https://onlyofficedocumentserverlatest-production.up.railway.app`
   
   **Variable 2:**
   - Name: `ONLYOFFICE_JWT_SECRET`
   - Value: `QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==`

### Step 2: Configure OnlyOffice Service
Click on the "documentserver" service card:
1. Go to "Variables" tab
2. Add Environment Variable:
   
   **Variable:**
   - Name: `ONLYOFFICE_JWT_SECRET`
   - Value: `QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==`

### Step 3: Test the Integration
1. Visit your main LoreWise app URL
2. Navigate to document editing
3. Open a document with OnlyOffice
4. Test saving and reopening

Success indicator: Documents should save properly without losing changes!
