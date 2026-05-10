'use client';

import { usePageStore, selectActiveChamber, selectPhase } from '@/store/pageStore';
import { useFeed } from '@/hooks/useFeed';
import type { ContentPost } from '@/types';
import styles from './ContentFeed.module.css';

// ─────────────────────────────────────────────────────────────
// Post card
// ─────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ContentPost }) {
  const { openContent } = usePageStore.getState();

  return (
    <article
      className={styles.card}
      onClick={() => openContent(post)}
      role="button"
      tabIndex={0}
      aria-label={post.caption ?? 'View post'}
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.caption ?? ''}
          className={styles.cardImage}
        />
      )}
      {post.caption && (
        <p className={styles.cardCaption}>{post.caption}</p>
      )}
      <span className={styles.cardType}>{post.type}</span>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// ContentFeed
// Shown in the right portion of the page when CONTENT_OPEN,
// or as a preview grid inside the menu panel — your call.
// Stubbed out here; wire up to real layout once designs land.
// ─────────────────────────────────────────────────────────────

export default function ContentFeed() {
  const phase         = usePageStore(selectPhase);
  const activeChamber = usePageStore(selectActiveChamber);
  const { postsForSection, isLoading, isError } = useFeed();

  const isVisible = phase === 'CONTENT_OPEN';

  if (!isVisible) return null;

  const posts = postsForSection(activeChamber);

  return (
    <div className={styles.feed} aria-live="polite">
      {isLoading && <p className={styles.status}>Loading…</p>}
      {isError   && <p className={styles.status}>Could not load posts.</p>}
      {!isLoading && posts.length === 0 && (
        <p className={styles.status}>No posts yet.</p>
      )}
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
