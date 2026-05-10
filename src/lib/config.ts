import type { Section, RevolverGeometry } from '@/types';

// ─────────────────────────────────────────────────────────────
// Revolver geometry
// Change these to resize the canvas cylinder.
// ─────────────────────────────────────────────────────────────

export const GEOMETRY: RevolverGeometry = {
  W: 280,
  H: 280,
  CX: 140,
  CY: 140,
  NUM: 6,
  OUTER_R: 104,
  CHAM_R: 26,
  BODY_R: 33,
  INNER_R: 28,
};

// ─────────────────────────────────────────────────────────────
// Section / chamber definitions
// Each section maps 1-to-1 to a cylinder chamber.
// Swap out items[] for real routes once routing is wired up.
// ─────────────────────────────────────────────────────────────

export const SECTIONS: Section[] = [
  {
    id: 0,
    label: 'Home',
    color: '#cc2222',
    items: [
      { label: 'Overview',       href: '/' },
      { label: 'Featured work',  href: '/featured' },
      { label: 'Latest updates', href: '/updates' },
      { label: 'Start here',     href: '/start' },
    ],
  },
  {
    id: 1,
    label: 'About',
    color: '#e03030',
    items: [
      { label: 'Our story', href: '/about' },
      { label: 'Team',      href: '/about/team' },
      { label: 'Values',    href: '/about/values' },
      { label: 'Press',     href: '/about/press' },
    ],
  },
  {
    id: 2,
    label: 'Work',
    color: '#991111',
    items: [
      { label: 'Portfolio',    href: '/work' },
      { label: 'Case studies', href: '/work/case-studies' },
      { label: 'Clients',      href: '/work/clients' },
      { label: 'Process',      href: '/work/process' },
    ],
  },
  {
    id: 3,
    label: 'Services',
    color: '#ff4444',
    items: [
      { label: 'Design',      href: '/services/design' },
      { label: 'Development', href: '/services/dev' },
      { label: 'Strategy',    href: '/services/strategy' },
      { label: 'Consulting',  href: '/services/consulting' },
    ],
  },
  {
    id: 4,
    label: 'Journal',
    color: '#aa1111',
    items: [
      { label: 'Articles',  href: '/journal' },
      { label: 'Notes',     href: '/journal/notes' },
      { label: 'Resources', href: '/journal/resources' },
      { label: 'Archive',   href: '/journal/archive' },
    ],
  },
  {
    id: 5,
    label: 'Contact',
    color: '#dd3333',
    items: [
      { label: 'Get in touch', href: '/contact' },
      { label: 'Inquiries',    href: '/contact/inquiries' },
      { label: 'Careers',      href: '/contact/careers' },
      { label: 'Location',     href: '/contact/location' },
    ],
  },
];
