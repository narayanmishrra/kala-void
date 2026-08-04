/* ============================================================
   BLCK VOID — components/sections/Hero.tsx
   ============================================================ */

'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { PillButton } from '@/components/ui/PillButton'
import { ease } from '@/lib/animations'

const lineVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: ease.standard,
      delay: 0.3 + i * 0.15,
    },
  }),
}

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: ease.standard, delay },
  }),
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReduced = useReducedMotion()

  return (
    <section
      ref={ref}
      style={{ minHeight: '100svh' }}
      className="relative"
    >
      <div className="container-page relative z-10">
        <div
          className="grid gap-8 items-center"
          style={{
            gridTemplateColumns: '55fr 45fr',
            minHeight: '100svh',
            paddingTop: 72,
          }}
        >
          {/* Left: Text */}
          <div className="flex flex-col justify-center py-20 lg:py-0">
            {/* Eyebrow */}
            <motion.div
              custom={0.2}
              variants={fadeVariant}
              initial={prefersReduced ? 'visible' : 'hidden'}
              animate={isInView ? 'visible' : 'hidden'}
              className="flex items-center gap-2 mb-6"
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: '#ffb829',
                  display: 'block',
                }}
              />
              <SectionLabel text="Performance Marketing Agency" />
            </motion.div>

            {/* Headline */}
            <h1
              className="type-heading-lg"
              style={{ color: '#ffffff', marginBottom: 24 }}
            >
              <motion.span
                custom={0}
                variants={lineVariant}
                initial={prefersReduced ? 'visible' : 'hidden'}
                animate={isInView ? 'visible' : 'hidden'}
                className="block"
                style={{ overflow: 'hidden', display: 'block' }}
              >
                We don&apos;t
              </motion.span>
              <motion.span
                custom={1}
                variants={lineVariant}
                initial={prefersReduced ? 'visible' : 'hidden'}
                animate={isInView ? 'visible' : 'hidden'}
                className="block"
                style={{ overflow: 'hidden', display: 'block' }}
              >
                fill space.
              </motion.span>
              <motion.span
                custom={2}
                variants={lineVariant}
                initial={prefersReduced ? 'visible' : 'hidden'}
                animate={isInView ? 'visible' : 'hidden'}
                className="block"
                style={{ color: '#8052ff', overflow: 'hidden', display: 'block' }}
              >
                We command it.
              </motion.span>
            </h1>

            {/* Body */}
            <motion.p
              custom={0.75}
              variants={fadeVariant}
              initial={prefersReduced ? 'visible' : 'hidden'}
              animate={isInView ? 'visible' : 'hidden'}
              className="type-body"
              style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 0 }}
            >
              BLCK VOID builds the systems behind measurable growth. From paid acquisition
              and lead generation to high-performance websites, 3D production, and
              conversion-focused design, we connect every moving part to the outcome that matters.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              custom={0.9}
              variants={fadeVariant}
              initial={prefersReduced ? 'visible' : 'hidden'}
              animate={isInView ? 'visible' : 'hidden'}
              className="flex flex-wrap items-center gap-6 mt-9"
            >
              <PillButton href="/contact" variant="primary" size="md">
                Start a Project
              </PillButton>
              <Link
                href="/work"
                className="btn-ghost group"
              >
                View Our Work
                <ArrowRight
                  size={14}
                  className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            {/* Trust microcopy */}
            <motion.div
              custom={1.1}
              variants={fadeVariant}
              initial={prefersReduced ? 'visible' : 'hidden'}
              animate={isInView ? 'visible' : 'hidden'}
              className="mt-16"
            >
              <span
                className="type-label"
                style={{ color: '#9a9a9a' }}
              >
                Built for brands that are ready to scale
              </span>
            </motion.div>
          </div>

          {/* Right: Reserved space for 3D Brain */}
          <div className="hidden lg:block relative" style={{ height: '100svh', marginTop: -72 }} />
        </div>
      </div>
    </section>
  )
}
