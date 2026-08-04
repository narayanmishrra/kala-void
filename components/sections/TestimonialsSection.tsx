/* ============================================================
   BLCK VOID — components/sections/TestimonialsSection.tsx
   ============================================================ */

'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer, ease } from '@/lib/animations'

const testimonials = [
  {
    quote: 'BLCK VOID gave us a clearer acquisition system in six weeks than we had built in the previous year. The difference was not more activity. It was better decisions.',
    name: 'Maya Shah',
    role: 'Marketing Director, Nova Form',
    metric: '↑ 4.2× ROAS',
  },
  {
    quote: 'They rebuilt our entire lead pipeline. From the first ad impression to the CRM handoff — every step now has a purpose and a number attached to it.',
    name: 'Raj Patel',
    role: 'CEO, Axis Developments',
    metric: '↑ 312% Leads',
  },
  {
    quote: 'Most agencies bring more noise. BLCK VOID brought less — and the results were louder. Our cost per acquisition dropped 40% in the first quarter.',
    name: 'Sarah Kim',
    role: 'Head of Growth, Helix Brands',
    metric: '↓ 40% CPA',
  },
]

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  const next = useCallback(() => setCurrent((c) => (c + 1) % testimonials.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length), [])

  useEffect(() => {
    if (paused || prefersReduced) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, prefersReduced, next])

  return (
    <section
      ref={ref}
      style={{ paddingTop: 120, paddingBottom: 120 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.div
        className="container-page"
        variants={containerVariant}
        initial={animate === 'hidden' ? 'hidden' : undefined}
        animate={animate}
      >
        <motion.div variants={itemVariant}>
          <SectionLabel text="Client Results" />
        </motion.div>
        <motion.h2
          variants={itemVariant}
          className="type-heading-lg"
          style={{ color: '#ffffff', marginTop: 24, marginBottom: 60 }}
        >
          Proof over<br />
          <span style={{ color: '#8052ff' }}>promises.</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          {/* Left: Decorative quote mark */}
          <motion.div variants={itemVariant} className="hidden lg:block">
            <span
              style={{
                fontSize: 120,
                fontWeight: 400,
                color: '#8052ff',
                lineHeight: 0.8,
                fontFamily: 'Georgia, serif',
                opacity: 0.4,
              }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
          </motion.div>

          {/* Right: Active testimonial */}
          <motion.div
            variants={itemVariant}
            className="relative"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: ease.standard }}
              >
                <blockquote>
                  {/* Mobile quote mark */}
                  <span
                    className="lg:hidden block mb-4"
                    style={{
                      fontSize: 64,
                      fontWeight: 400,
                      color: '#8052ff',
                      lineHeight: 0.8,
                      fontFamily: 'Georgia, serif',
                      opacity: 0.6,
                    }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>

                  <p
                    className="font-[family-name:var(--font-ppneuemontreal)] text-[27px] font-normal leading-[1.3] text-white"
                    style={{ maxWidth: 560 }}
                  >
                    {testimonials[current].quote}
                  </p>

                  <div className="mt-8">
                    <span
                      className="type-nav text-white block"
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {testimonials[current].name}
                    </span>
                    <span
                      className="font-[family-name:var(--font-ppneuemontreal)] text-[14px] font-normal text-[#9a9a9a] block mt-1"
                    >
                      {testimonials[current].role}
                    </span>
                    {/* Result badge */}
                    <span
                      className="inline-flex items-center mt-3 px-3 py-1 rounded-full border border-[#ffb829] text-[#ffb829] text-[12px] font-semibold uppercase tracking-[0.35px]"
                      style={{ backgroundColor: 'rgba(255,184,41,0.1)' }}
                    >
                      {testimonials[current].metric}
                    </span>
                  </div>
                </blockquote>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-12">
              <button
                onClick={prev}
                className="flex items-center justify-center border border-[rgba(255,255,255,0.2)] hover:border-[#8052ff] hover:bg-[rgba(128,82,255,0.1)] text-white transition-all duration-200 rounded-full"
                style={{ width: 48, height: 48 }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={next}
                className="flex items-center justify-center border border-[rgba(255,255,255,0.2)] hover:border-[#8052ff] hover:bg-[rgba(128,82,255,0.1)] text-white transition-all duration-200 rounded-full"
                style={{ width: 48, height: 48 }}
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2 ml-4">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: i === current ? '#8052ff' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
