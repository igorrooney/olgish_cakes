import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export async function verifyAdminToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      username: payload.username as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function isAdminAuthenticated(request: Request): Promise<boolean> {
  try {
    const token = request.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('admin_auth_token='))
      ?.split('=')[1];

    if (!token) {
      return false;
    }

    const payload = await verifyAdminToken(token);
    return payload !== null && payload.role === 'admin';
  } catch (error) {
    console.error('Admin authentication check failed:', error);
    return false;
  }
}
