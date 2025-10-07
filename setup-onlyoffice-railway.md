# Quick OnlyOffice Setup on Railway

## 🚀 Step-by-Step Setup

### 1. Add OnlyOffice Service to Railway

1. **Go to Railway Dashboard** → Your Project
2. **Click "New Service"** → "GitHub Repo" 
3. **Select your lorewise repository**
4. **Configure the service:**
   - **Name**: `onlyoffice-documentserver`
   - **Build Command**: `docker build -f onlyoffice-railway.dockerfile -t onlyoffice .`
   - **Start Command**: (leave empty - handled by Dockerfile)

### 2. Set Environment Variables

Add these to your OnlyOffice service:

```bash
# Required
ONLYOFFICE_JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-12345
DOCSERV_PORT=8080

# Optional (for better performance)
DB_TYPE=postgresql
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database
```

### 3. Update LoreWise Service

Add these to your LoreWise service:

```bash
NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=https://your-onlyoffice-service-url.railway.app
ONLYOFFICE_JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-12345
```

### 4. Deploy and Test

1. **Deploy both services**
2. **Check OnlyOffice logs** - should show "Document Server is running"
3. **Test in LoreWise** - create a new document

## 🔧 Troubleshooting

### OnlyOffice Not Starting
- Check logs for JWT_SECRET errors
- Ensure port 8080 is exposed
- Verify Dockerfile is correct

### LoreWise Can't Connect
- Check `NEXT_PUBLIC_ONLYOFFICE_SERVER_URL` is correct
- Ensure JWT_SECRET matches in both services
- Check OnlyOffice health endpoint: `https://your-onlyoffice-url.railway.app/healthcheck`

### Document Not Loading
- Check OnlyOffice logs for document download errors
- Verify LoreWise API routes are working
- Check CORS settings

## ✅ Success Indicators

- OnlyOffice logs show "Document Server is running"
- LoreWise loads documents without errors
- Documents save properly
- Full office suite interface is available

## 🎯 What You Get

- **Full Office Suite**: Word, Excel, PowerPoint editing
- **Real-time Collaboration**: Multiple users can edit
- **Native Interface**: Complete Microsoft Office-like experience
- **File Support**: DOCX, XLSX, PPTX, PDF, and more
- **Auto-save**: Documents save automatically
- **Version Control**: Track document changes
