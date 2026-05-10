import { create } from 'zustand';
import type { PagePhase, ContentPost } from '@/types';

// ─────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────

interface PageState {
  // ── Phase ──────────────────────────────────────────────────
  phase: PagePhase;

  // ── Chamber ────────────────────────────────────────────────
  /** Which chamber is currently loaded/active. -1 = none. */
  activeChamber: number;

  /** Which chamber the pointer is hovering. -1 = none. */
  hoveredChamber: number;

  // ── Content ────────────────────────────────────────────────
  /** Post currently shown in the content overlay. null = none. */
  activeContent: ContentPost | null;

  // ── Actions ────────────────────────────────────────────────
  /**
   * User clicked a chamber while in IDLE.
   * Triggers: IDLE → SPINNING
   */
  beginSpin: (chamberIdx: number) => void;

  /**
   * GSAP spin complete — revolver should now slide.
   * Triggers: SPINNING → SLIDING
   */
  onSpinComplete: () => void;

  /**
   * Slide animation done — menu is fully visible.
   * Triggers: SLIDING → MENU_OPEN
   */
  onSlideComplete: () => void;

  /**
   * User clicked a different chamber while MENU_OPEN.
   * Triggers: MENU_OPEN → SWITCHING → MENU_OPEN (handled by sequencer)
   */
  switchChamber: (chamberIdx: number) => void;

  /**
   * Quick-spin after switchChamber is done.
   * Triggers: SWITCHING → MENU_OPEN
   */
  onSwitchComplete: () => void;

  /**
   * User clicked a nav item — open a content overlay.
   * Triggers: MENU_OPEN → CONTENT_OPEN
   */
  openContent: (post: ContentPost) => void;

  /**
   * User dismissed the content overlay.
   * Triggers: CONTENT_OPEN → MENU_OPEN
   */
  closeContent: () => void;

  /**
   * User closed the menu (✕ button).
   * Triggers: MENU_OPEN → CLOSING → IDLE
   */
  close: () => void;

  /**
   * Closing animation finished.
   * Triggers: CLOSING → IDLE
   */
  onCloseComplete: () => void;

  // ── Pointer (no render — canvas handles its own draw loop) ──
  setHoveredChamber: (idx: number) => void;
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const usePageStore = create<PageState>((set) => ({
  phase: 'IDLE',
  activeChamber: -1,
  hoveredChamber: -1,
  activeContent: null,

  beginSpin: (chamberIdx) =>
    set({ phase: 'SPINNING', activeChamber: chamberIdx }),

  onSpinComplete: () =>
    set({ phase: 'SLIDING' }),

  onSlideComplete: () =>
    set({ phase: 'MENU_OPEN' }),

  switchChamber: (chamberIdx) =>
    set({ phase: 'SWITCHING', activeChamber: chamberIdx }),

  onSwitchComplete: () =>
    set({ phase: 'MENU_OPEN' }),

  openContent: (post) =>
    set({ phase: 'CONTENT_OPEN', activeContent: post }),

  closeContent: () =>
    set({ phase: 'MENU_OPEN', activeContent: null }),

  close: () =>
    set({ phase: 'CLOSING' }),

  onCloseComplete: () =>
    set({ phase: 'IDLE', activeChamber: -1, activeContent: null }),

  setHoveredChamber: (idx) =>
    set({ hoveredChamber: idx }),
}));

// ─────────────────────────────────────────────────────────────
// Selectors (memoised slices — prevents unnecessary re-renders)
// ─────────────────────────────────────────────────────────────

export const selectPhase          = (s: PageState) => s.phase;
export const selectActiveChamber  = (s: PageState) => s.activeChamber;
export const selectHoveredChamber = (s: PageState) => s.hoveredChamber;
export const selectActiveContent  = (s: PageState) => s.activeContent;

/** True whenever the cylinder should be interactive */
export const selectCylinderActive = (s: PageState) =>
  s.phase === 'IDLE' || s.phase === 'MENU_OPEN';
