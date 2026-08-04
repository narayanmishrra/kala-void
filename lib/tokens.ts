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
  buttons: '24px',
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
// Constellation of multicolored triangular particles forming an
// organic brain — knowledge visualized as distributed intelligence.
// Merged-geometry renderer: 3 draw calls for the whole scene.

export const particleSystem = {
  // Palette: Electric Iris leads, Saffron Spark + Deep Verdant punctuate,
  // long tail of accent hues keeps the constellation "multicolored".
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
  colorWeights: [0.26, 0.12, 0.08, 0.12, 0.10, 0.09, 0.08, 0.06, 0.05, 0.04],

  // Density — merged buffers make these cheap (1 draw call each layer).
  // Airy, not crowded: each triangle reads as an individual mote.
  countDesktop: 1900,
  countTablet: 1500,
  countMobile: 850,
  countAmbientDesktop: 240,
  countAmbientMobile: 110,

  // Organic brain volume (unit-space brain × scale).
  scaleDesktop: 1.38,
  scaleMobile: 1.2,
  scatterFactor: 3.4, // entrance scatter sphere radius (× scale)

  // Neural connection web between near particles — kept dim so the
  // triangles remain the hero of the scene.
  connectionDistanceFactor: 0.22, // × scale
  connectionMaxPerParticle: 2,
  connectionMaxTotal: 1500,
  connectionBrightnessMin: 0.08,
  connectionBrightnessMax: 0.18,

  // Motion (time-based, frame-rate independent).
  rotationSpeedY: 0.1, // rad/s
  breatheAmplitude: 0.012,
  breatheFrequency: 0.55, // rad/s
  driftAmplitude: 0.055,
  parallaxMaxTilt: 9, // degrees, both axes
  parallaxRate: 3.2, // 1/s exponential smoothing
  entranceDuration: 2300, // ms
  twinkleFrequency: 1.3, // rad/s

  // Pointer repulsion — the constellation yields around the cursor.
  repelRadius: 1.15,
  repelStrength: 0.6,
  repelRate: 9, // 1/s exponential smoothing

  cameraFov: 50,
  fitMarginX: 1.8, // brain half-width margin for responsive fit
  fitMarginY: 1.3,

  // ─── 4-STATE SCROLL MORPH MACHINE TOKENS ─────────────────────
  // Scroll-driven fullscreen environment: brain (0) -> disperse (1) -> bulb (2) -> globe (3)
  states: 4,
  scrollSmoothRate: 5.5,
  morphStagger: 0.28,
  turbulence: 0.85,
  sideOffsetFactor: 0.42, // fraction of viewport half-width for left/right positioning
  shapeUnitMin: 0.62,
  shapeUnitMax: 1.55,
  shapeUnitFactor: 0.30,
  brainScale: 1.0,
  bulbScale: 0.95,
  globeScale: 1.05,
  brainRotSpeed: 0.1,
  disperseRotSpeed: 0.02,
  bulbRotSpeed: 0.05,
  globeRotSpeed: 0.16,
  webFadeStart: 1.05,
  webFadeEnd: 2.4,

  seed: 1337,
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
