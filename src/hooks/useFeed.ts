import { useQuery } from '@tanstack/react-query';
import type { FeedResponse, ContentPost } from '@/types';

// ─────────────────────────────────────────────────────────────
// Feed fetcher
// Replace the URL with your Next.js API route once it exists.
// ─────────────────────────────────────────────────────────────

async function fetchFeed(): Promise<FeedResponse> {
  const res = await fetch('/api/feed');
  if (!res.ok) throw new Error('Feed fetch failed');
  return res.json() as Promise<FeedResponse>;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

interface UseFeedReturn {
  posts: ContentPost[];
  isLoading: boolean;
  isError: boolean;
  /** Posts filtered to a specific section/chamber */
  postsForSection: (sectionId: number) => ContentPost[];
}

export function useFeed(): UseFeedReturn {
  const { data, isLoading, isError } = useQuery<FeedResponse>({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    // Poll every 60 seconds — adjust or replace with a WebSocket/SSE
    // subscription once the real-time pipeline is built.
    refetchInterval: 60_000,
    // Keep stale data visible while refetching
    staleTime: 30_000,
    // Return empty on error rather than blowing up the UI
    placeholderData: { posts: [], updatedAt: new Date().toISOString() },
  });

  const posts = data?.posts ?? [];

  const postsForSection = (sectionId: number): ContentPost[] =>
    posts.filter((p) => p.sectionId === sectionId);

  return { posts, isLoading, isError, postsForSection };
}

// ─────────────────────────────────────────────────────────────
// Static placeholder data
// Drop this into <QueryClient defaultOptions> or use it in
// Storybook / tests until the API is ready.
// ─────────────────────────────────────────────────────────────

export const PLACEHOLDER_POSTS: ContentPost[] = [
  {
    id: 'placeholder-0',
    type: 'text',
    sectionId: 0,
    createdAt: new Date().toISOString(),
    caption: 'Welcome — this is a placeholder home post.',
    author: 'admin',
  },
  {
    id: 'placeholder-1',
    type: 'photo',
    sectionId: 1,
    createdAt: new Date().toISOString(),
    caption: 'About section placeholder image.',
    imageUrl: 'https://placehold.co/600x400',
    author: 'admin',
  },
  {
    id: 'placeholder-2',
    type: 'instagram',
    sectionId: 2,
    createdAt: new Date().toISOString(),
    caption: 'Work section — pulled from Instagram.',
    imageUrl: 'https://placehold.co/600x600',
    externalUrl: 'https://instagram.com',
    author: 'instagram',
  },
];
