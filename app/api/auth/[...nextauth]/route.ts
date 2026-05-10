import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Next.js 16 requires route handlers to accept (request, context) where
// context.params is a Promise. NextAuth v4's handler expects the old
// synchronous signature, so we wrap it to stay compatible.
const authHandler = NextAuth(authOptions);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // Await params so Next.js 16 doesn't throw, then delegate to NextAuth
  await context.params;
  return authHandler(request as any, context as any);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  await context.params;
  return authHandler(request as any, context as any);
}
