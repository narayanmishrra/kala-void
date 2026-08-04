/* ============================================================
   BLCK VOID — lib/tokens.ts
   TypeScript design token constants.
   Import from here — never hardcode values in components.
   ============================================================ */

// ─── COLOR TOKENS ────────────────────────────────────────────

export const colors = {
  void: '#000000',
  boneWhite: '#ffffff',
  ashGray: '#9a9a9a',
  silverMist: '#bdbdbd',
  electricIris: '#8052ff',
  saffronSpark: '#ffb829',
  deepVerdant: '#15846e',

  // Opacity variants
  electricIris10: 'rgba(128, 82, 255, 0.10)',
  electricIris15: 'rgba(128, 82, 255, 0.15)',
  electricIris20: 'rgba(128, 82, 255, 0.20)',
  electricIris30: 'rgba(128, 82, 255, 0.30)',
  electricIris60: 'rgba(128, 82, 255, 0.60)',
  saffronSpark10: 'rgba(255, 184, 41, 0.10)',
  white05: 'rgba(255, 255, 255, 0.05)',
  white08: 'rgba(255, 255, 255, 0.08)',
  white15: 'rgba(255, 255, 255, 0.15)',
  white20: 'rgba(255, 255, 255, 0.20)',
  white30: 'rgba(255, 255, 255, 0.30)',
  white80: 'rgba(255, 255, 255, 0.80)',
  error: '#ff6b6b',
} as const

export type ColorKey = keyof typeof colors

// ─── TYPOGRAPHY TOKENS ───────────────────────────────────────

export const fontWeight = {
  extralight: 200,
  regular: 400,
  semibold: 600,
  bold: 700,
} as const

export const fontSize = {
  caption: '12px',
  navLabel: '14px',
  base: '15px',
  body: '18px',
  heading2xs: '24px',
  headingXs: '27px',
  subheading: '36px',
  headingSm: '42px',
  heading: '48px',
  headingLg: '78px',
  display: '113px',
} as const

export const letterSpacing = {
  display: '-4.52px',
  headingLg: '-3.12px',
  heading: '-1.68px',
  headingSm: '-1.68px',
  heading2xs: '-0.48px',
  navLabel: '0.35px',
  label: '0.35px',
} as const

// ─── SPACING TOKENS ──────────────────────────────────────────

export const spacing = {
  unit: 6,
  s6: '6px',
  s12: '12px',
  s18: '18px',
  s24: '24px',
  s30: '30px',
  s36: '36px',
  s60: '60px',
  s96: '96px',
  s120: '120px',
} as const

// ─── BORDER RADIUS TOKENS ────────────────────────────────────

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  threeXl: '24px',
  full: '9999px',
  nav: '24px',
  tags: '9999px',
  cards: '24px',
  buttons: '9999px',
  portrait: '24px',
} as const

// ─── ANIMATION TOKENS ────────────────────────────────────────

export const duration = {
  fast: 150,
  base: 200,
  slow: 300,
  enter: 600,
  dramatic: 800,
} as const

export const easing = {
  standard: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const

// ─── LAYOUT TOKENS ───────────────────────────────────────────

export const layout = {
  pageMaxWidth: '1280px',
  pageMaxWidthNum: 1280,
  navHeight: '72px',
  navHeightNum: 72,
  sectionPaddingY: '120px',
  sectionPaddingYSm: '60px',
  contentMaxProse: '480px',
  contentMaxProseLg: '560px',
} as const

// ─── Z-INDEX TOKENS ──────────────────────────────────────────

export const zIndex = {
  below: -1,
  base: 0,
  canvas: 5,
  above: 10,
  overlay: 40,
  nav: 50,
  toast: 60,
} as const

// ─── THREE.JS PARTICLE SYSTEM TOKENS ─────────────────────────

export const particleSystem = {
  colors: [
    '#8052ff',
    '#9b72ff',
    '#6030cc',
    '#ffb829',
    '#15846e',
    '#b347ff',
    '#4df0ff',
    '#ff6b9d',
    '#7b52ab',
    '#3d85c8',
  ],
  colorWeights: [0.30, 0.15, 0.10, 0.10, 0.08, 0.08, 0.07, 0.05, 0.04, 0.03],
  countDesktop: 5000,
  countTablet: 3000,
  countMobile: 1500,
  countAmbient: 800,
  sizeMin: 1.5,
  sizeMax: 3.0,
  strokeWidth: 1,
  rotationSpeedY: 0.0003,
  driftAmplitude: 2,
  driftFrequency: 0.001,
  parallaxMaxTilt: 15,
  parallaxLerpFactor: 0.05,
  entranceDuration: 2500,
  ambientOpacityMin: 0.15,
  ambientOpacityMax: 0.35,
  ambientSpreadFactor: 1.8,
  targetFPS: 60,
  minFPS: 30,
  deltaTimeMax: 1 / 30,
} as const

// ─── SERVICE DATA ────────────────────────────────────────────

export const services = [
  {
    id: 'web-development',
    number: '01',
    name: 'Web Development',
    shortName: 'Web Dev',
    description: 'High-performance websites and web applications engineered for conversion. Next.js, React, and modern web stacks — built to scale.',
    deliverable: 'PRODUCTION-READY WEB EXPERIENCE',
    icon: 'Code2',
    cta: '/services',
  },
  {
    id: 'meta-google-ads',
    number: '02',
    name: 'Meta & Google Ads',
    shortName: 'Paid Ads',
    description: 'Data-driven paid acquisition across Meta and Google ecosystems. We manage creative, bidding, and attribution — you collect results.',
    deliverable: 'FULL PAID MEDIA MANAGEMENT',
    icon: 'TrendingUp',
    cta: '/services',
  },
  {
    id: 'lead-generation',
    number: '03',
    name: 'Lead Generation',
    shortName: 'Lead Gen',
    description: 'End-to-end lead pipeline architecture. From landing page to CRM handoff — every touchpoint optimized for qualified conversion.',
    deliverable: 'QUALIFIED LEAD PIPELINE',
    icon: 'Target',
    cta: '/services',
  },
  {
    id: '3d-animation-vfx',
    number: '04',
    name: '3D Animation & VFX',
    shortName: '3D / VFX',
    description: 'Cinematic 3D animation and visual effects for campaigns, product launches, and brand storytelling that stops the scroll.',
    deliverable: 'BROADCAST-QUALITY ANIMATION',
    icon: 'Layers',
    cta: '/services',
  },
  {
    id: 'ui-ux-design',
    number: '05',
    name: 'UI/UX Design',
    shortName: 'Design',
    description: 'Interface design grounded in user behavior and conversion psychology. Every screen engineered to guide, persuade, and convert.',
    deliverable: 'COMPLETE DESIGN SYSTEM',
    icon: 'Pen',
    cta: '/services',
  },
  {
    id: 'whatsapp-marketing',
    number: '06',
    name: 'WhatsApp Marketing',
    shortName: 'WhatsApp',
    description: 'Direct-channel marketing at scale. Automated campaigns, broadcast sequences, and conversational flows that drive action.',
    deliverable: 'WHATSAPP BROADCAST SYSTEM',
    icon: 'MessageCircle',
    cta: '/services',
  },
] as const

export type ServiceId = (typeof services)[number]['id']

// ─── NAVIGATION DATA ──────────────────────────────────────────

export const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const
