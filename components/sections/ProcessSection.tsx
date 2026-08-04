/* ============================================================
   BLCK VOID — components/sections/ProcessSection.tsx
   ============================================================ */

'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer } from '@/lib/animations'

const phases = [
  {
    number: '01',
    name: 'DIAGNOSE',
    description: 'We audit your digital presence from the inside out: analytics, ad accounts, creative, landing pages, conversion paths, and CRM flow.',
    deliverable: 'FULL DIGITAL AUDIT + STRATEGY BRIEF',
  },
  {
    number: '02',
    name: 'ARCHITECT',
    description: 'We design the acquisition system. Every channel gets a role. Every touchpoint has a measurable purpose.',
    deliverable: 'MULTI-CHANNEL GROWTH ARCHITECTURE',
  },
  {
    number: '03',
    name: 'EXECUTE',
    description: 'We build, launch, test, and iterate. Creative, code, media, and automation move in parallel.',
    deliverable: 'LIVE CAMPAIGNS + DEPLOYED ASSETS',
  },
  {
    number: '04',
    name: 'SCALE',
    description: 'We increase what works and remove what does not. Budget allocation, creative refreshes, and conversion improvements compound over time.',
    deliverable: 'MONTHLY PERFORMANCE REPORT + GROWTH ROADMAP',
  },
]

export function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#000000', paddingTop: 120, paddingBottom: 120 }}
    >
      <motion.div
        className="container-page"
        variants={containerVariant}
        initial={animate === 'hidden' ? 'hidden' : undefined}
        animate={animate}
      >
        <motion.div variants={itemVariant}>
          <SectionLabel text="The Method" />
        </motion.div>
        <motion.h2
          variants={itemVariant}
          className="type-heading-lg"
          style={{ color: '#ffffff', marginTop: 24 }}
        >
          From signal<br />
          <span style={{ color: '#8052ff' }}>to scale.</span>
        </motion.h2>
        <motion.p
          variants={itemVariant}
          className="type-body"
          style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 24 }}
        >
          We do not launch campaigns into the dark. We find the signal,
          build the system, and scale what proves itself.
        </motion.p>

        <div className="mt-20 flex flex-col">
          {phases.map((phase, i) => (
            <motion.div key={phase.number} variants={itemVariant}>
              <div
                className="grid items-start gap-6 py-12"
                style={{ gridTemplateColumns: '120px 1fr' }}
              >
                {/* Ghosted number */}
                <span
                  className="font-[family-name:var(--font-ppneuemontreal)] text-[113px] font-normal leading-none hidden lg:block"
                  style={{ color: 'rgba(128,82,255,0.18)', letterSpacing: '-4.52px' }}
                >
                  {phase.number}
                </span>
                <div>
                  {/* Name */}
                  <h3
                    className="type-heading-sm"
                    style={{ color: '#ffffff' }}
                  >
                    {phase.name}
                  </h3>
                  {/* Description */}
                  <p
                    className="type-body"
                    style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 16 }}
                  >
                    {phase.description}
                  </p>
                  {/* Deliverable */}
                  <span
                    className="type-label"
                    style={{ color: '#ffb829', marginTop: 20, display: 'block' }}
                  >
                    {phase.deliverable}
                  </span>
                </div>
              </div>
              {i < phases.length - 1 && <hr className="divider-void" />}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
