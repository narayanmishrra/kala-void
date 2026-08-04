/* ============================================================
   BLCK VOID — components/sections/TeamSection.tsx
   ============================================================ */

'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Link2, MessageCircle } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer } from '@/lib/animations'

const teamMembers = [
  {
    name: 'Arjun Mehta',
    role: 'Founder & Strategy Lead',
    bio: 'Ten years building acquisition systems across DTC, SaaS, and real estate. Obsessed with the space between traffic and revenue.',
    linkedin: '#',
    instagram: '#',
  },
  {
    name: 'Priya Desai',
    role: 'Creative Director',
    bio: 'From 3D cinematic renders to scroll-stopping ad creative — every visual asset exists to move the metric, not just fill the feed.',
    linkedin: '#',
    instagram: '#',
  },
  {
    name: 'Kai Nakamura',
    role: 'Head of Engineering',
    bio: 'Full-stack architect focused on performance. Ships websites that score 95+ on Lighthouse and convert at twice the industry average.',
    linkedin: '#',
    instagram: '#',
  },
]

interface TeamSectionProps {
  preview?: boolean
  limit?: number
}

export function TeamSection({ preview = false, limit }: TeamSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  const members = limit ? teamMembers.slice(0, limit) : teamMembers

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
          <SectionLabel text="The People Behind the System" />
        </motion.div>
        <motion.h2
          variants={itemVariant}
          className="type-heading-lg"
          style={{ color: '#ffffff', marginTop: 24 }}
        >
          Small team.<br />
          <span style={{ color: '#8052ff' }}>Large signal.</span>
        </motion.h2>
        <motion.p
          variants={itemVariant}
          className="type-body"
          style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 24 }}
        >
          Strategy, media, design, code, and production in one focused team.
          No layers of account management between the question and the person solving it.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 mt-16">
          {members.map((member) => (
            <motion.div key={member.name} variants={itemVariant}>
              {/* Portrait placeholder — floats on the void, no card surface */}
              <div
                className="w-full group"
                style={{ aspectRatio: '3/4' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="type-heading-lg text-[rgba(128,82,255,0.18)] group-hover:text-[rgba(128,82,255,0.4)] transition-colors duration-300"
                    style={{ letterSpacing: '-3.12px' }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>

              {/* Role */}
              <span
                className="type-label block mt-3"
                style={{ color: '#8052ff' }}
              >
                {member.role}
              </span>

              {/* Name */}
              <h3
                className="font-[family-name:var(--font-ppneuemontreal)] text-[27px] font-normal text-white"
              >
                {member.name}
              </h3>

              {/* Bio */}
              <p
                className="font-[family-name:var(--font-ppneuemontreal)] text-[14px] font-normal text-[#9a9a9a] mt-2"
                style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {member.bio}
              </p>

              {/* Socials */}
              <div className="flex items-center gap-3 mt-4">
                <a
                  href={member.linkedin}
                  className="text-[#9a9a9a] hover:text-white transition-colors duration-200"
                  aria-label={`${member.name} on LinkedIn`}
                  rel="noopener noreferrer"
                >
                  <Link2 size={16} strokeWidth={1.5} />
                </a>
                <a
                  href={member.instagram}
                  className="text-[#9a9a9a] hover:text-white transition-colors duration-200"
                  aria-label={`${member.name} on Instagram`}
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
