'use client';

import { usePageStore, selectPhase } from '@/store/pageStore';
import RevolverCylinder from '@/components/RevolverCylinder';
import MenuPanel        from '@/components/MenuPanel';
import ContentFeed      from '@/components/ContentFeed';
import styles           from './page.module.css';

export default function HomePage() {
  const phase = usePageStore(selectPhase);
  const showHint = phase === 'IDLE';

  return (
    <main className={styles.scene}>
      <RevolverCylinder />
      <MenuPanel />
      <ContentFeed />

      {/* Hint fades out once the user first interacts */}
      <p
        className={styles.hint}
        style={{ opacity: showHint ? 1 : 0 }}
        aria-hidden={!showHint}
      >
        click a chamber to open
      </p>
    </main>
  );
}
