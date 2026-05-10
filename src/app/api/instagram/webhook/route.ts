import { NextRequest, NextResponse } from 'next/server';

/**
 * Instagram Webhooks — receiver endpoint
 * Register this URL in the Facebook Developer console:
 *   https://developers.facebook.com/apps/<APP_ID>/webhooks/
 *
 * Facebook will:
 *   GET  /api/instagram/webhook  — verification handshake (see below)
 *   POST /api/instagram/webhook  — new media notifications
 *
 * Docs: https://developers.facebook.com/docs/graph-api/webhooks/
 */

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN ?? 'replace-me';

// ── Verification handshake (GET) ─────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// ── New media notification (POST) ────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();

  // TODO:
  // 1. Validate the X-Hub-Signature-256 header against INSTAGRAM_APP_SECRET
  // 2. Extract the media ID from body.entry[0].changes[0].value.media_id
  // 3. Fetch full media details from Graph API using the media ID
  // 4. Persist to your database / KV store
  // 5. Optionally push a Server-Sent Event or WebSocket message to
  //    connected clients so they update without waiting for the next poll

  console.log('Instagram webhook payload:', JSON.stringify(body, null, 2));

  return new NextResponse('OK', { status: 200 });
}
