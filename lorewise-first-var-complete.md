# First Environment Variable Set!

✅ NEXT_PUBLIC_ONLYOFFICE_SERVER_URL = https://onlyofficedocumentserverlatest-production.up.railway.app

## Next: Add ONLYOFFICE_JWT_SECRET to LoreWise
Same LoreWise service:
- Name: ONLYOFFICE_JWT_SECRET
- Value: QuPiojQsKyvavkpQSny0tnOp2ErQ1v+0wm5e7i6REhAeVInnhdtCPueHWkikke1u2QNu6Mo9u7pAha0orQ9gcQ==

## Then: Add JWT Secret to OnlyOffice Service
Switch to documentserver service and add:
- Name: ONLYOFFICE_JWT_SECRET  
- Value: (same secret as above)
