import { NextResponse } from 'next/server';
import type { FeedResponse } from '@/types';

/**
 * GET /api/feed
 *
 * Returns all content posts. Currently returns placeholder data.
 *
 * TODO: replace stub with real data source:
 *   1. Instagram Graph API polling (store results in DB / KV)
 *   2. Or: read from Postgres/Supabase/PlanetScale
 *   3. Or: read from a CMS (Sanity, Contentful, etc.)
 *
 * The Instagram webhook receiver (POST /api/instagram/webhook)
 * should write new posts here so the feed picks them up on
 * the next poll cycle.
 */
export async function GET(): Promise<NextResponse<FeedResponse>> {
  const placeholder: FeedResponse = {
    posts: [
      {
        id: 'stub-0',
        type: 'text',
        sectionId: 0,
        createdAt: new Date().toISOString(),
        caption: 'Home section — stub post from /api/feed.',
        author: 'system',
      },
      {
        id: 'stub-2',
        type: 'photo',
        sectionId: 2,
        createdAt: new Date().toISOString(),
        caption: 'Work section — stub photo.',
        imageUrl: 'https://placehold.co/600x600',
        author: 'system',
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(placeholder);
}
