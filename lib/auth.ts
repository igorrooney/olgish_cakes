import { jwtVerify } from 'jose';

// Helper function to get JWT secret with runtime validation
function getJWTSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return JWT_SECRET;
}

export interface AdminUser {
  username: string;
  role: string;
  iat?: number;
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const secret = new TextEncoder().encode(getJWTSecret());
    const { payload } = await jwtVerify(token, secret);
    
    return {
      username: payload.username as string,
      role: payload.role as string,
      iat: payload.iat
    };
  } catch (error) {
    // Log JWT verification errors but don't expose sensitive details
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      console.error('JWT_SECRET environment variable error:', error.message);
    }
    // Return null for invalid tokens (malformed, expired, wrong secret, etc.)
    return null;
  }
}

export async function isAdmin(token: string): Promise<boolean> {
  const user = await verifyToken(token);
  return user?.role === 'admin';
}
