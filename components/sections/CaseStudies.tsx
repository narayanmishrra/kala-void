/* ============================================================
   BLCK VOID — components/sections/CaseStudies.tsx
   ============================================================ */

'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer } from '@/lib/animations'

interface CaseStudy {
  client: string
  industry: string
  result: string
  description: string
  services: string[]
  image: string
}

const caseStudies: CaseStudy[] = [
  {
    client: 'Nova Form',
    industry: 'DTC / Beauty',
    result: '4.2× ROAS',
    description: 'Meta creative testing, landing page rebuild, and full-funnel retargeting increased paid acquisition efficiency while reducing creative fatigue.',
    services: ['Meta Ads', 'Web Dev', 'UI/UX'],
    image: '/og/case-novaform.png',
  },
  {
    client: 'Axis Developments',
    industry: 'Real Estate',
    result: '312% More Qualified Leads',
    description: 'Landing page architecture, Google Search campaigns, WhatsApp follow-up automation, and CRM routing built a consistent lead pipeline.',
    services: ['Google Ads', 'Lead Gen', 'WhatsApp'],
    image: '/og/case-axis.png',
  },
]

interface CaseStudiesProps {
  featured?: boolean
  limit?: number
}

export function CaseStudies({ featured = false, limit }: CaseStudiesProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  const studies = limit ? caseStudies.slice(0, limit) : caseStudies

  return (
    <section
      ref={ref}
      style={{ paddingTop: 120, paddingBottom: 120 }}
    >
      <motion.div
        className="container-page"
        variants={containerVariant}
        initial={animate === 'hidden' ? 'hidden' : undefined}
        animate={animate}
      >
        <motion.div variants={itemVariant}>
          <SectionLabel text="Selected Work" />
        </motion.div>
        <motion.h2
          variants={itemVariant}
          className="type-heading"
          style={{ color: '#ffffff', marginTop: 24 }}
        >
          Results that<br />
          <span style={{ color: '#8052ff' }}>speak volumes.</span>
        </motion.h2>
        <motion.p
          variants={itemVariant}
          className="type-body"
          style={{ color: '#bdbdbd', maxWidth: 450, marginTop: 24 }}
        >
          Different industries. Different constraints. The same standard: measurable movement.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-9 mt-16">
          {studies.map((study, i) => (
            <motion.div key={study.client} variants={itemVariant}>
              {/* Media placeholder — floats on the void, no card surface */}
              <div
                className="relative w-full group"
                style={{ aspectRatio: '16/9' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="type-display text-[rgba(128,82,255,0.22)] group-hover:text-[rgba(128,82,255,0.5)] transition-colors duration-300"
                    style={{ letterSpacing: '-4.52px' }}
                  >
                    {study.client.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Industry tag */}
              <div className="mt-3">
                <span className="tag-outline">{study.industry}</span>
              </div>

              {/* Client name */}
              <h3
                className="font-[family-name:var(--font-ppneuemontreal)] text-[27px] font-normal text-white mt-3"
              >
                {study.client}
              </h3>

              {/* Result metric */}
              <p
                className="font-[family-name:var(--font-ppneuemontreal)] text-[36px] font-normal mt-1.5"
                style={{ color: '#ffb829', lineHeight: 1.2 }}
              >
                {study.result}
              </p>

              {/* Description */}
              <p
                className="type-body"
                style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 12 }}
              >
                {study.description}
              </p>

              {/* Service tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {study.services.map((s) => (
                  <span
                    key={s}
                    className="font-[family-name:var(--font-ppneuemontreal)] text-[12px] font-semibold uppercase tracking-[0.35px] text-[#9a9a9a] px-2 py-1 rounded-full border border-[rgba(255,255,255,0.1)]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Ghost link */}
              <Link
                href="/work"
                className="btn-ghost group mt-6 inline-flex"
              >
                View Case Study
                <ArrowRight
                  size={14}
                  className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
