'use client';

import { usePageStore, selectPhase, selectActiveChamber } from '@/store/pageStore';
import { SECTIONS } from '@/lib/config';
import type { NavItem } from '@/types';
import styles from './MenuPanel.module.css';

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function NavItemRow({ item }: { item: NavItem }) {
  return (
    <a
      className={styles.menuItem}
      href={item.href}
      onClick={(e) => e.preventDefault()} // remove once routing is wired
    >
      {item.label}
      <span className={styles.arr} aria-hidden>→</span>
    </a>
  );
}

interface SubMenuProps {
  idx: number;
  active: boolean;
}

function SubMenu({ idx, active }: SubMenuProps) {
  const section = SECTIONS[idx];
  return (
    <div
      className={`${styles.submenu} ${active ? styles.active : ''}`}
      aria-hidden={!active}
    >
      <p className={styles.menuLabel}>Chamber {['I','II','III','IV','V','VI'][idx]}</p>
      <p className={styles.sectionTitle}>{section.label}</p>
      {section.items.map((item) => (
        <NavItemRow key={item.href} item={item} />
      ))}
    </div>
  );
}

function ChamberTabs({
  activeChamber,
  onSwitch,
}: {
  activeChamber: number;
  onSwitch: (idx: number) => void;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Switch section">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={i === activeChamber}
          aria-label={s.label}
          className={`${styles.tab} ${i === activeChamber ? styles.tabActive : ''}`}
          style={i === activeChamber ? { background: s.color, borderColor: s.color } : {}}
          onClick={() => onSwitch(i)}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MenuPanel
// ─────────────────────────────────────────────────────────────

export default function MenuPanel() {
  const phase         = usePageStore(selectPhase);
  const activeChamber = usePageStore(selectActiveChamber);
  const { close, switchChamber } = usePageStore.getState();

  const isOpen =
    phase === 'SLIDING'      ||
    phase === 'MENU_OPEN'    ||
    phase === 'SWITCHING'    ||
    phase === 'CONTENT_OPEN';

  const handleTabSwitch = (idx: number) => {
    if (phase === 'MENU_OPEN' && idx !== activeChamber) {
      switchChamber(idx);
    }
  };

  return (
    <div
      className={`${styles.panel} ${isOpen ? styles.open : ''}`}
      role="navigation"
      aria-label="Site navigation"
    >
      <button
        className={styles.closeBtn}
        onClick={close}
        aria-label="Close menu"
      >
        ✕
      </button>

      {SECTIONS.map((_, i) => (
        <SubMenu key={i} idx={i} active={i === activeChamber} />
      ))}

      <ChamberTabs activeChamber={activeChamber} onSwitch={handleTabSwitch} />
    </div>
  );
}
