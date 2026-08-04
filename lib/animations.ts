/* ============================================================
   BLCK VOID — lib/animations.ts
   Master animation variant library for Framer Motion.
   ============================================================ */

import type { Variants } from 'framer-motion'

// ─── EASING CURVES ──────────────────────────────────────────

export const ease = {
  standard: [0.16, 1, 0.3, 1] as [number, number, number, number],
  enter: [0.22, 1, 0.36, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  smooth: [0, 0, 0.2, 1] as [number, number, number, number],
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const

// ─── ENTRANCE VARIANTS ──────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.standard },
  },
}

export const fadeUpSubtle: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.standard },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: ease.standard },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: ease.standard },
  },
}

export const lineReveal: Variants = {
  hidden: { opacity: 0, y: 60, skewY: 2 },
  visible: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.65, ease: ease.standard },
  },
}

// ─── STAGGER CONTAINERS ─────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

// ─── HOVER / INTERACTION ────────────────────────────────────

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2, ease: ease.smooth },
}

export const tapPress = {
  scale: 0.97,
  transition: { duration: 0.12, ease: ease.smooth },
}

// ─── MOBILE MENU ────────────────────────────────────────────

export const mobileMenuOverlay: Variants = {
  hidden: { opacity: 0, y: '-100%' },
  visible: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.4, ease: ease.standard },
  },
  exit: {
    opacity: 0,
    y: '-100%',
    transition: { duration: 0.3, ease: ease.exit },
  },
}

export const mobileMenuLink: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: ease.standard },
  },
}

export const mobileMenuContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
}

// ─── REDUCED MOTION FALLBACKS ────────────────────────────────

export const reducedFadeUp: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
}

export const reducedContainer: Variants = {
  hidden: {},
  visible: {},
}

// ─── PARALLAX ───────────────────────────────────────────────

export const heroTextParallax = {
  inputRange: [0, 500],
  outputRange: [0, -80],
} as const

export const heroCanvasParallax = {
  inputRange: [0, 500],
  outputRange: [0, -40],
} as const
