/* ============================================================
   BLCK VOID — components/sections/MetricsSection.tsx
   ============================================================ */

'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer } from '@/lib/animations'

const metrics = [
  { value: '$2.3M+', label: 'Managed Ad Spend' },
  { value: '12,000+', label: 'Leads Generated' },
  { value: '4.2×', label: 'Average Client ROAS' },
  { value: '98%', label: 'Client Retention' },
]

function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReduced = useReducedMotion()
  const [display, setDisplay] = useState(prefersReduced ? value : '0')

  useEffect(() => {
    if (prefersReduced || !isInView) {
      setDisplay(value)
      return
    }
    // For complex values like "$2.3M+" or "4.2×", just show after delay
    const timer = setTimeout(() => setDisplay(value), 300)
    return () => clearTimeout(timer)
  }, [isInView, value, prefersReduced])

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="metric-number block"
        style={{ transition: 'opacity 600ms ease' }}
      >
        {display}
      </span>
      <span className="metric-label block">{label}</span>
    </div>
  )
}

export function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#000000', paddingTop: 96, paddingBottom: 96 }}
    >
      <motion.div
        className="container-page"
        variants={containerVariant}
        initial={animate === 'hidden' ? 'hidden' : undefined}
        animate={animate}
      >
        <motion.div
          variants={itemVariant}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {metrics.map((metric, i) => (
            <div key={metric.label} className="relative">
              <AnimatedMetric value={metric.value} label={metric.label} />
              {i < metrics.length - 1 && (
                <div
                  className="hidden lg:block absolute right-[-24px] top-0 bottom-0 w-px"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
