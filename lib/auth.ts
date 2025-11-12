import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface AdminUser {
  username: string;
  role: string;
  iat: number;
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
    return decoded;
  } catch {
    return null;
  }
}

export function isAdmin(token: string): boolean {
  const user = verifyToken(token);
  return user?.role === 'admin';
}
