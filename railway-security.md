# Railway Security Configuration for OnlyOffice

## Essential Environment Variables for Maximum Security

Set these in Railway dashboard for your OnlyOffice service:

### JWT Authentication
```
ONLYOFFICE_JWT_SECRET=your-super-secure-secret-minimum-32-chars-long
JWT_ENABLED=true
```

### Database Security  
```
# Use Railway's managed PostgreSQL for OnlyOffice storage
POSTGRES_HOST=${postgres.VAR.POSTGRES_HOST}
POSTGRES_PORT=${postgres.VAR.POSTGRES_PORT}
POSTGRES_USER=${postgres.VAR.POSTGRES_USER}
POSTGRES_PASSWORD=${postgres.VAR.POSTGRES_PASSWORD}
POSTGRES_DATABASE=${postgres.VAR.POSTGRES_DATABASE}
```

### Redis Security (Optional)
Railway can provide Redis for session management

## Security Best Practices Applied

✅ **JWT Authentication** between OnlyOffice ↔ Your App
✅ **Database encryption** via Railway PostgreSQL
✅ **HTTPS encryption** for all data transmission
✅ **Access tokens** only (no password storage)
✅ **Network isolation** between services
✅ **Automatic security updates** via Docker image updates

## Why Self-Hosting Is More Secure For You:

1. **Your data never leaves your infrastructure**
2. **You control all security policies**
3. **No third-party data access** risk
4. **Full audit trail** capability 
5. **Encryption keys under your control**
6. **Compliance requirements** under your control
