import jwt from 'jsonwebtoken';

// Generate secure JWT secret for production
const JWT_SECRET = process.env.ONLYOFFICE_JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ONLYOFFICE_JWT_SECRET must be set in production environment');
  }
  return 'dev-secret-change-in-production';
})();

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
