/* ============================================================
   BLCK VOID — components/sections/ServicesOrbit.tsx
   ============================================================ */

'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Code2, TrendingUp, Target, Layers, Pen, MessageCircle } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { services } from '@/lib/tokens'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer, ease } from '@/lib/animations'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Code2, TrendingUp, Target, Layers, Pen, MessageCircle,
}

export function ServicesOrbit() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  const orbitRadius = 200
  const centerX = 250
  const centerY = 250

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-start">
          {/* Left: Text */}
          <div>
            <motion.div variants={itemVariant}>
              <SectionLabel text="What We Do" />
            </motion.div>
            <motion.h2
              variants={itemVariant}
              className="type-heading-lg"
              style={{ color: '#ffffff', marginTop: 24 }}
            >
              Every channel.<br />
              <span style={{ color: '#8052ff' }}>Mastered.</span>
            </motion.h2>
            <motion.p
              variants={itemVariant}
              className="type-body"
              style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 24 }}
            >
              We don&apos;t treat marketing channels as separate departments. Paid media,
              creative, websites, design, and direct response work better when they are
              built as one connected system.
            </motion.p>

            {/* Service List */}
            <motion.div
              variants={itemVariant}
              className="mt-12 flex flex-col"
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group grid items-center py-4 cursor-pointer"
                  style={{
                    gridTemplateColumns: '40px 1fr 20px',
                    transition: 'transform 200ms ease',
                  }}
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <span
                    className="type-label"
                    style={{
                      color: hoveredService === service.id ? '#8052ff' : '#ffb829',
                      transition: 'color 200ms ease',
                    }}
                  >
                    {service.number}
                  </span>
                  <span
                    className="font-[family-name:var(--font-ppneuemontreal)] text-[18px] font-normal text-white"
                  >
                    {service.name}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-[#9a9a9a] transition-transform duration-200 group-hover:translate-x-1"
                  />
                  <div
                    className="col-span-3"
                    style={{
                      height: 1,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      marginTop: 6,
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Orbit Visualization (SVG) */}
          <motion.div
            variants={itemVariant}
            className="hidden lg:flex items-center justify-center"
          >
            <svg
              width="500"
              height="500"
              viewBox="0 0 500 500"
              className="w-full h-auto"
              aria-hidden="true"
            >
              {/* Center logo (static while the ring orbits) */}
              <circle cx={centerX} cy={centerY} r={30} fill="#8052ff" opacity={0.1} />
              <circle cx={centerX} cy={centerY} r={30} stroke="rgba(128,82,255,0.3)" strokeWidth={1} fill="none" />
              {/* Void mark in center */}
              <polygon points={`${centerX-8},${centerY+12} ${centerX},${centerY-10} ${centerX+8},${centerY+12} ${centerX+5},${centerY+4} ${centerX-5},${centerY+4}`} fill="#8052ff" />
              <polygon points={`${centerX-4},${centerY+8} ${centerX+4},${centerY+8} ${centerX},${centerY+1}`} fill="#15846e" />

              {/* Glow ring animation */}
              <circle
                cx={centerX}
                cy={centerY}
                r={35}
                stroke="rgba(128,82,255,0.15)"
                strokeWidth={2}
                fill="none"
              >
                <animate attributeName="r" values="30;38;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Orbiting ring — nodes + connectors rotate as one system */}
              <g className="orbit-spin">
                {/* Connecting lines */}
                {services.map((service, i) => {
                  const angle = (i / services.length) * Math.PI * 2 - Math.PI / 2
                  const x = centerX + Math.cos(angle) * orbitRadius
                  const y = centerY + Math.sin(angle) * orbitRadius
                  const isHovered = hoveredService === service.id
                  return (
                    <line
                      key={`line-${service.id}`}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke={isHovered ? 'rgba(128,82,255,0.5)' : 'rgba(128,82,255,0.15)'}
                      strokeWidth={1}
                      style={{ transition: 'stroke 200ms ease' }}
                    />
                  )
                })}

                {/* Orbit nodes — counter-rotated so labels stay level */}
                {services.map((service, i) => {
                  const angle = (i / services.length) * Math.PI * 2 - Math.PI / 2
                  const x = centerX + Math.cos(angle) * orbitRadius
                  const y = centerY + Math.sin(angle) * orbitRadius
                  const isHovered = hoveredService === service.id

                  return (
                    <g
                      key={service.id}
                      className="orbit-spin-reverse cursor-pointer"
                      style={{ transformOrigin: `${x}px ${y}px` }}
                      onMouseEnter={() => setHoveredService(service.id)}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <rect
                        x={x - 55}
                        y={y - 14}
                        width={110}
                        height={28}
                        rx={14}
                        fill={isHovered ? 'rgba(128,82,255,0.15)' : 'rgba(128,82,255,0.08)'}
                        stroke={isHovered ? 'rgba(128,82,255,0.6)' : 'rgba(128,82,255,0.2)'}
                        strokeWidth={1}
                        style={{ transition: 'all 200ms ease' }}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={11}
                        fontFamily="var(--font-ppneuemontreal)"
                        fontWeight={600}
                        letterSpacing="0.35px"
                        style={{ textTransform: 'uppercase' as const, transition: 'all 200ms ease' }}
                      >
                        {service.shortName}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
