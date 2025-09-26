# Railway Environment Variables

## Environment Variables to Set in Railway Dashboard:

### For LoreWise App Service:
```
NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=https://your-onlyoffice-service.railway.app
ONLYOFFICE_JWT_SECRET=your-super-secure-jwt-secret-here
NODE_ENV=production
```

### For OnlyOffice Service:
```
ONLYOFFICE_JWT_SECRET=your-super-secure-jwt-secret-here
JWT_ENABLED=true
DOCSERV_PORT=8080
PGFILE_PORT=3000
CUSTOM_PORT=3001
JWT_PATH=/var/www/onlyoffice/documentserver/Web.config/\
```

### For Database Service (Optional):
- PostgreSQL will be auto-configured by Railway
