// ─────────────────────────────────────────────────────────────
// Page state machine
// ─────────────────────────────────────────────────────────────

/**
 * Discrete phases the page can be in.
 * The sequencer drives transitions between these — nothing
 * should mutate phase directly except the Zustand store actions.
 */
export type PagePhase =
  | 'IDLE'          // revolver centred, nothing open
  | 'SPINNING'      // cylinder is spinning (first open)
  | 'SLIDING'       // revolver translating to the left
  | 'MENU_OPEN'     // menu panel fully visible, cylinder interactive
  | 'SWITCHING'     // user clicked a different chamber (quick spin)
  | 'CONTENT_OPEN'  // a content overlay / feed panel is visible
  | 'CLOSING';      // everything animating back to IDLE


// ─────────────────────────────────────────────────────────────
// Sections / chambers
// ─────────────────────────────────────────────────────────────

export interface Section {
  id: number;
  label: string;       // display name, e.g. "Home"
  color: string;       // hex accent used on cylinder + active tab
  items: NavItem[];    // sub-links inside the menu panel
}

export interface NavItem {
  label: string;
  href: string;
}


// ─────────────────────────────────────────────────────────────
// Content / feed
// ─────────────────────────────────────────────────────────────

export type ContentType = 'instagram' | 'text' | 'photo' | 'link';

export interface ContentPost {
  id: string;
  type: ContentType;
  sectionId: number;       // which chamber/section this belongs to
  createdAt: string;       // ISO timestamp
  caption?: string;
  imageUrl?: string;
  externalUrl?: string;    // original Instagram URL etc.
  author?: string;
}

/**
 * Shape returned by the /api/feed endpoint.
 * Wrap in a discriminated union later if you add pagination.
 */
export interface FeedResponse {
  posts: ContentPost[];
  updatedAt: string;
}


// ─────────────────────────────────────────────────────────────
// Canvas / revolver geometry (kept as constants but typed here
// so consumers can import the shape without magic numbers)
// ─────────────────────────────────────────────────────────────

export interface RevolverGeometry {
  W: number;
  H: number;
  CX: number;
  CY: number;
  NUM: number;
  OUTER_R: number;
  CHAM_R: number;
  BODY_R: number;
  INNER_R: number;
}

export interface Point {
  x: number;
  y: number;
}


// ─────────────────────────────────────────────────────────────
// GSAP tween handle (gsap doesn't ship great TS types for this)
// ─────────────────────────────────────────────────────────────

export interface TweenHandle {
  kill: () => void;
}
