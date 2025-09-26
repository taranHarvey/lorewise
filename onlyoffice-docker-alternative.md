# OnlyOffice Docker Service Addition

## Option 1: If OnlyOffice Service is Missing

Add the OnlyOffice Document Server service to your Railway project:

1. Click the `+` button in the left sidebar
2. Choose "Docker"
3. Configure as follows:

```dockerfile
FROM onlyoffice/documentserver:latest
ENV JWT_ENABLED=true
ENV DOCSERV_PORT=8080
EXPOSE 8080
CMD ["bash", "-c", "/var/www/onlyoffice/documentserver/documentserver-jenkins.sh"]
```

## Option 2: If Service Exists But Not Visible

1. Scroll or expand the canvas view
2. Check if OnlyOffice service is positioned outside the visible area
3. Click and drag to locate all services
