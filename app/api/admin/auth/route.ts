import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { withRateLimit } from "@/lib/rate-limit";

// Helper function to get environment variables with runtime validation
function getAdminCredentials() {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required");
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET };
}

// POST - Admin login
async function handlePOST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Get admin credentials (validates environment variables at runtime)
    const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = getAdminCredentials();

    // Verify credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create JWT token
      const secret = new TextEncoder().encode(JWT_SECRET);
      const token = await new SignJWT({
        username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer('olgish-cakes') // Set issuer for verification
        .setAudience('olgish-cakes-admin') // Set audience for verification
        .setExpirationTime('24h')
        .setIssuedAt()
        .sign(secret);

      // Set secure cookie
      const response = NextResponse.json({
        success: true,
        message: "Login successful"
      });

      response.cookies.set('admin_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 5 login attempts per minute
export const POST = withRateLimit(handlePOST, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 login attempts per minute
});

// GET - Check auth status
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify JWT token properly
    const { ADMIN_USERNAME, JWT_SECRET } = getAdminCredentials();
    const secret = new TextEncoder().encode(JWT_SECRET);

    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'], // Explicitly require HS256 to prevent algorithm confusion
        audience: 'olgish-cakes-admin', // Verify audience
        issuer: 'olgish-cakes', // Verify issuer
        clockTolerance: '5s' // Allow 5s clock skew for serverless environments
      });

      // Verify token payload matches admin user
      if (payload.username === ADMIN_USERNAME && payload.role === 'admin') {
        return NextResponse.json({ authenticated: true }, { status: 200 });
      } else {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
    } catch {
      // Token is invalid or expired
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}