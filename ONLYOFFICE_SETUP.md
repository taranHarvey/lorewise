# OnlyOffice Document Server Setup for LoreWise

This guide will help you set up OnlyOffice Document Server with JWT security for your LoreWise application.

## Prerequisites

- Docker installed on your system
- Node.js and npm
- Your LoreWise application running

## Step 1: Start OnlyOffice Document Server with JWT

Run the following Docker command to start OnlyOffice with JWT security enabled:

```bash
docker run -d \
  --name onlyoffice-documentserver \
  -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=ggU6fsU4yhuCpfb7FBmKmdsA3kv3Qdbw \
  -e JWT_HEADER=Authorization \
  -e JWT_IN_BODY=true \
  onlyoffice/documentserver
```

## Step 2: Verify Docker Container

Check if the container is running:

```bash
docker ps
```

You should see the `onlyoffice-documentserver` container running on port 8080.

## Step 3: Test OnlyOffice Server

Open your browser and go to:
```
http://localhost:8080
```

You should see the OnlyOffice Document Server welcome page.

## Step 4: Environment Variables

Make sure your `.env.local` file contains:

```env
# OnlyOffice Configuration
ONLYOFFICE_JWT_SECRET=ggU6fsU4yhuCpfb7FBmKmdsA3kv3Qdbw
ONLYOFFICE_DOCUMENT_SERVER_URL=http://localhost:8080
ONLYOFFICE_CALLBACK_URL=http://localhost:3000/api/onlyoffice/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=http://localhost:8080
```

## Step 5: Start Your Application

```bash
npm run dev
```

## Step 6: Test Integration

1. Go to `http://localhost:3000/test-onlyoffice`
2. The OnlyOffice editor should load with JWT security enabled
3. You should be able to edit documents

## Troubleshooting

### OnlyOffice Not Loading
- Check if Docker container is running: `docker ps`
- Check container logs: `docker logs onlyoffice-documentserver`
- Ensure port 8080 is not used by other applications

### JWT Errors
- Verify JWT_SECRET matches in both Docker and .env.local
- Check browser console for JWT-related errors
- Ensure JWT_ENABLED=true in Docker command

### Document Not Found Errors
- Check if your Firebase database has test documents
- Verify document ID in the URL matches database entries

### CORS Issues
- OnlyOffice server and your app must be accessible to each other
- Check network configuration if running in different environments

## Production Setup

For production, consider:

1. **Use environment-specific URLs**: Replace localhost with your actual domain
2. **Secure JWT Secret**: Generate a strong, unique JWT secret
3. **HTTPS**: Use HTTPS for both your app and OnlyOffice server
4. **Docker Compose**: Use docker-compose for easier management
5. **Persistent Storage**: Add volume mounts for document storage

### Production Docker Command Example:

```bash
docker run -d \
  --name onlyoffice-documentserver \
  -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=your-production-secret-here \
  -e JWT_HEADER=Authorization \
  -e JWT_IN_BODY=true \
  -v /your/document/path:/var/www/onlyoffice/Data \
  onlyoffice/documentserver
```

## Security Notes

- **JWT Secret**: Never commit JWT secrets to version control
- **Network Security**: Restrict access to OnlyOffice server in production
- **HTTPS**: Always use HTTPS in production
- **Firewall**: Configure firewall rules appropriately
