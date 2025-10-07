# Simple OnlyOffice Setup on Railway

## 🚀 Easy Setup Steps

### 1. Add OnlyOffice Service to Railway

1. **Go to Railway Dashboard** → Your Project
2. **Click "New Service"** → "GitHub Repo" 
3. **Select your lorewise repository**
4. **Configure the service:**
   - **Name**: `onlyoffice-documentserver`
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: (leave empty - Railway will auto-detect)
   - **Start Command**: (leave empty - handled by Dockerfile)

### 2. Set Dockerfile Path

In your OnlyOffice service settings:
- **Dockerfile Path**: `Dockerfile.onlyoffice`

### 3. Set Environment Variables

Add these to your OnlyOffice service:

```bash
# Required
ONLYOFFICE_JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-12345
DOCSERV_PORT=8080
```

### 4. Update LoreWise Service

Add these to your LoreWise service:

```bash
NEXT_PUBLIC_ONLYOFFICE_SERVER_URL=https://your-onlyoffice-service-url.railway.app
ONLYOFFICE_JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-12345
```

### 5. Deploy and Test

1. **Deploy both services**
2. **Check OnlyOffice logs** - should show "Document Server is running"
3. **Test in LoreWise** - create a new document

## 🔧 Railway Configuration

### OnlyOffice Service Settings:
- **Source**: GitHub Repo (your lorewise repo)
- **Dockerfile Path**: `Dockerfile.onlyoffice`
- **Port**: 8080
- **Environment Variables**: See above

### LoreWise Service Settings:
- **Source**: GitHub Repo (your lorewise repo)
- **Environment Variables**: See above

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
