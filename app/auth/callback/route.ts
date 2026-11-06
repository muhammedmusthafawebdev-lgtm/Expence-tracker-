import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase Auth Callback Handler
 * Handles both PKCE code exchange and OTP token hash verification for Next.js App Router.
 *
 * When Supabase dispatches a Magic Link, email confirmation, or password recovery link,
 * the user is redirected to this callback route with:
 * - PKCE flow: ?code=123456...
 * - Token Hash flow: ?token_hash=...&type=email|magiclink|signup|recovery
 * - Error flow: ?error=access_denied&error_description=...
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';

  // Safe redirect path validation: prevent open redirect vulnerability
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  // Create destination URL
  const targetUrl = new URL(safeNext, requestUrl.origin);

  // If Supabase returned an auth error (e.g., expired OTP link)
  if (error) {
    targetUrl.searchParams.set('auth_error', error);
    if (errorDescription) {
      targetUrl.searchParams.set('auth_error_description', errorDescription);
    }
    return NextResponse.redirect(targetUrl);
  }

  // Pass authorization code to the client application
  // Since the client browser holds the PKCE code_verifier in localStorage,
  // the client-side Supabase client performs the exchangeCodeForSession seamlessly
  if (code) {
    targetUrl.searchParams.set('code', code);
  }

  if (tokenHash) {
    targetUrl.searchParams.set('token_hash', tokenHash);
  }

  if (type) {
    targetUrl.searchParams.set('type', type);
  }

  return NextResponse.redirect(targetUrl);
}
