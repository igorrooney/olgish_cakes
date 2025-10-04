import { NextResponse } from "next/server";

// POST - Admin logout
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout successful"
  });

  // Clear the auth cookie
  response.cookies.set('admin_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/'
  });

  return response;
}
