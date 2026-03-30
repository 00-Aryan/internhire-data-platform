import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    
    // Delete both auth cookies
    cookieStore.delete('auth_user');
    cookieStore.delete('auth_role');
    
    // Get the actual host from request headers (works with proxies/production)
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    
    // Build redirect URL using actual host client is accessing from
    const redirectUrl = host ? `${protocol}://${host}/` : '/';
    console.log('[LOGOUT] Redirecting to:', redirectUrl);
    
    const response = NextResponse.redirect(redirectUrl);
    
    // Prevent caching of this logout action
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    console.error('Logout error:', errorMessage);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
