import { NextRequest, NextResponse } from 'next/server';

/**
 * Extract guest token from raw token, URL, or QR payload.
 * Accepts:
 *   { token: "tok-xxx" }
 *   { url: "https://...?guest=tok-xxx" }
 *   { url: "https://..." } - parses guest param from URL
 */
function extractToken(body: any): string | null {
  // Direct token — but check if it's a URL first
  if (body.token) {
    // If token looks like a URL, extract guest param from it
    if (typeof body.token === 'string' && (body.token.startsWith('http://') || body.token.startsWith('https://'))) {
      try {
        const url = new URL(body.token);
        const guestParam = url.searchParams.get('guest');
        if (guestParam) return guestParam;
      } catch {}
    }
    return body.token;
  }
  // URL with guest param
  if (body.url) {
    try {
      const url = new URL(body.url);
      return url.searchParams.get('guest');
    } catch {
      // Not a valid URL, try raw
      return body.url || null;
    }
  }
  // JSON payload from QR (backward compat)
  if (body.guest_token) return body.guest_token;
  if (body.invitation_id && body.guest_token) return body.guest_token;
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = extractToken(body);
  if (!token) return NextResponse.json({ status: 'INVALID_QR', message: 'Token tidak ditemukan di QR' }, { status: 400 });
  try {
    const { processScanDb } = await import('@/lib/prisma/db');
    const result = await processScanDb(token);
    return NextResponse.json(result);
  } catch {
    const { processScan } = await import('@/lib/shared-store');
    return NextResponse.json(processScan(token));
  }
}
