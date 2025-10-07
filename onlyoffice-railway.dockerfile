# OnlyOffice Document Server for Railway
FROM onlyoffice/documentserver:latest

# Set environment variables for Railway
ENV JWT_ENABLED=true
ENV JWT_SECRET=${ONLYOFFICE_JWT_SECRET}
ENV DOCSERV_PORT=8080

# Configure OnlyOffice for production
ENV DB_TYPE=postgresql
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DATABASE=${POSTGRES_DATABASE}

# Redis configuration for better performance
ENV REDIS_SERVER_HOST=${REDIS_SERVER_HOST}
ENV REDIS_SERVER_PORT=${REDIS_SERVER_PORT}
ENV REDIS_SERVER_PWD=${REDIS_SERVER_PWD}

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/healthcheck || exit 1

# Start OnlyOffice Document Server
CMD ["bash", "-c", "/var/www/onlyoffice/documentserver/documentserver-jenkins.sh"]
