# OnlyOffice Document Server Setup on Railway

## Step 1: Add OnlyOffice Service to Railway

1. Go to your Railway project dashboard
2. Click "New Service" 
3. Select "GitHub Repo" and choose your lorewise repository
4. In the service settings, change the build command to use the OnlyOffice Dockerfile:
   - **Build Command**: `docker build -f onlyoffice-railway.dockerfile -t onlyoffice .`
   - **Start Command**: Leave empty (handled by Dockerfile)

## Step 2: Configure Environment Variables

Add these environment variables to your OnlyOffice service:

### Required Variables:
```
ONLYOFFICE_JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
DOCSERV_PORT=8080
```

### Optional Database Variables (for better performance):
```
DB_TYPE=postgresql
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database
```

### Optional Redis Variables (for better performance):
```
REDIS_SERVER_HOST=your-redis-host
REDIS_SERVER_PORT=6379
REDIS_SERVER_PWD=your-redis-password
```

## Step 3: Update LoreWise Environment Variables

In your LoreWise service, add:
```
NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=https://your-onlyoffice-service-url.railway.app
ONLYOFFICE_JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

## Step 4: Deploy and Test

1. Deploy both services
2. Check OnlyOffice logs to ensure it's running
3. Test document creation in LoreWise

## Troubleshooting

- **Port Issues**: OnlyOffice runs on port 8080 by default
- **JWT Issues**: Make sure the JWT_SECRET is the same in both services
- **CORS Issues**: OnlyOffice should handle CORS automatically
- **Health Check**: OnlyOffice provides a health check endpoint at `/healthcheck`
