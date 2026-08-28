import { jwtVerify } from 'jose';
import { getAdminJwtSecret } from './admin/jwt-secret.server';
import { toSafeOperationalError } from './security/safe-operational-error';

export interface AdminUser {
  username: string;
  role: string;
  iat?: number;
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const secret = new TextEncoder().encode(getAdminJwtSecret());
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'], // Explicitly require HS256 to prevent algorithm confusion
      audience: 'olgish-cakes-admin', // Verify audience
      issuer: 'olgish-cakes', // Verify issuer
      clockTolerance: '5s' // Allow 5s clock skew for serverless environments
    });
    
    return {
      username: payload.username as string,
      role: payload.role as string,
      iat: payload.iat
    };
  } catch (error) {
    // Log JWT verification errors but don't expose sensitive details
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      console.error('JWT secret validation failed', {
        operation: 'auth.jwt-secret',
        ...toSafeOperationalError(error),
      });
    }
    // Return null for invalid tokens (malformed, expired, wrong secret, etc.)
    return null;
  }
}

export async function isAdmin(token: string): Promise<boolean> {
  const user = await verifyToken(token);
  return user?.role === 'admin';
}
