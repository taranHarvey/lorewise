# Safe DNS Record Cleanup

## 🔍 These are Squarespace default records - safe to delete:
- 4× A records (*@ pointing at Squarespace IPs)
- 1× www CNAME (*pointing at ext-sq.squarespace.com) 
- 1× HTTPS record *(certificate handling)

## 🎯 Delete these 6 records:
1. Click the trash icon next to "Squarespace Defaults"
2. Confirm deletion
3. Add your new Railway record
   - HOST: @
   - TYPE: CNAME
   - DATA: ynbb7icc.up.railway.app

## Result → lorewise.io points to your Railway app!
