import jwt from 'jsonwebtoken';

// Generate secure JWT secret for production
const getJwtSecret = () => {
  const secret = process.env.ONLYOFFICE_JWT_SECRET;
  if (secret) {
    return secret;
  }
  
  // For production during build or when secret provided in Railway
  if (process.env.NODE_ENV === 'production') {
    return 'onlyoffice-build-temp-secret-change-in-railway';
  }
  
  return 'dev-secret-change-in-production';
};

const JWT_SECRET = getJwtSecret();

export function generateOnlyOfficeToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

export function verifyOnlyOfficeToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
