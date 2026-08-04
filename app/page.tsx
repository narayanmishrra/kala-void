/* ============================================================
   BLCK VOID — app/page.tsx
   Homepage: precise section ordering.
   ============================================================ */

import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Hero } from '@/components/sections/Hero'
import { ResultsMarquee } from '@/components/sections/ResultsMarquee'
import ParticleField from '@/components/canvas/ParticleField'

export const metadata: Metadata = {
  title: "BLCK VOID — We Don't Fill Space. We Command It.",
  description:
    'Full-service performance marketing agency. Meta & Google Ads, ' +
    'Lead Generation, Web Development, 3D Animation, UI/UX Design, ' +
    'VFX, WhatsApp Marketing. Measurable outcomes.',
  openGraph: {
    title: "BLCK VOID — We Don't Fill Space. We Command It.",
    description: 'Performance marketing that delivers results across every channel.',
    url: 'https://blckvoid.com',
    images: [{ url: '/og/homepage.png', width: 1200, height: 630 }],
  },
}

const ServicesOrbit = dynamic(
  () => import('@/components/sections/ServicesOrbit').then(m => ({ default: m.ServicesOrbit })),
  { ssr: true, loading: () => <SectionSkeleton height="800px" /> }
)

const CaseStudies = dynamic(
  () => import('@/components/sections/CaseStudies').then(m => ({ default: m.CaseStudies })),
  { ssr: true, loading: () => <SectionSkeleton height="700px" /> }
)

const ProcessSection = dynamic(
  () => import('@/components/sections/ProcessSection').then(m => ({ default: m.ProcessSection })),
  { ssr: true, loading: () => <SectionSkeleton height="600px" /> }
)

const MetricsSection = dynamic(
  () => import('@/components/sections/MetricsSection').then(m => ({ default: m.MetricsSection })),
  { ssr: true, loading: () => <SectionSkeleton height="300px" /> }
)

const TestimonialsSection = dynamic(
  () => import('@/components/sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })),
  { ssr: true, loading: () => <SectionSkeleton height="500px" /> }
)

const TeamSection = dynamic(
  () => import('@/components/sections/TeamSection').then(m => ({ default: m.TeamSection })),
  { ssr: true, loading: () => <SectionSkeleton height="600px" /> }
)

const ContactCTA = dynamic(
  () => import('@/components/sections/ContactCTA').then(m => ({ default: m.ContactCTA })),
  { ssr: true, loading: () => <SectionSkeleton height="700px" /> }
)

function SectionSkeleton({ height }: { height: string }) {
  return <div aria-hidden="true" style={{ width: '100%', height, backgroundColor: 'transparent' }} />
}

export default function HomePage() {
  return (
    <>
      <ParticleField />
      <Hero />
      <ResultsMarquee />
      <Suspense fallback={<SectionSkeleton height="800px" />}>
        <ServicesOrbit />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="700px" />}>
        <CaseStudies featured limit={2} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="600px" />}>
        <ProcessSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="300px" />}>
        <MetricsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="600px" />}>
        <TeamSection preview limit={3} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="700px" />}>
        <ContactCTA />
      </Suspense>
    </>
  )
}
