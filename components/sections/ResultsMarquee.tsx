/* ============================================================
   BLCK VOID — components/sections/ResultsMarquee.tsx
   CSS-native infinite marquee.
   ============================================================ */

'use client'

const metricItems = [
  { number: '4.2×', label: 'Average ROAS on Meta Campaigns' },
  { number: '12,000+', label: 'Qualified Leads Generated' },
  { number: '340%', label: 'Organic Traffic Growth' },
  { number: '$2.3M', label: 'Ad Spend Managed' },
  { number: '98%', label: 'Client Retention Rate' },
  { number: '500+', label: '3D Assets Delivered' },
]

const serviceNames = [
  'META ADS', 'GOOGLE ADS', 'WEB DEVELOPMENT',
  '3D ANIMATION', 'LEAD GENERATION', 'UI/UX DESIGN',
  'VFX', 'WHATSAPP MARKETING',
]

function MarqueeRow({ items, direction, speed = 40 }: {
  items: React.ReactNode[]
  direction: 'left' | 'right'
  speed?: number
}) {
  const duplicated = [...items, ...items, ...items]
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%)',
      }}
    >
      <div
        className="flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        style={{
          animation: direction === 'left'
            ? `marquee-left ${speed}s linear infinite`
            : `marquee-right ${speed}s linear infinite`,
          willChange: 'transform',
        }}
        aria-hidden="true"
      >
        {duplicated.map((item, i) => (
          <div key={i} className="flex items-center">
            {item}
            <span
              className="mx-6 text-[#8052ff]"
              aria-hidden="true"
            >
              •
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResultsMarquee() {
  const metricNodes = metricItems.map((m, i) => (
    <div key={i} className="flex items-baseline gap-2 whitespace-nowrap">
      <span
        className="font-[family-name:var(--font-ppneuemontreal)] text-[22px] font-semibold"
        style={{ color: '#ffb829', letterSpacing: '-0.5px' }}
      >
        {m.number}
      </span>
      <span
        className="font-[family-name:var(--font-ppneuemontreal)] text-[14px] font-normal"
        style={{ color: '#9a9a9a' }}
      >
        {m.label}
      </span>
    </div>
  ))

  const serviceNodes = serviceNames.map((name, i) => (
    <span
      key={i}
      className="font-[family-name:var(--font-ppneuemontreal)] text-[13px] font-semibold uppercase whitespace-nowrap"
      style={{ color: '#ffffff', letterSpacing: '0.35px' }}
    >
      {name}
    </span>
  ))

  return (
    <section
      aria-label="Agency performance metrics"
      style={{
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 48,
        paddingBottom: 48,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <p className="sr-only">
        BLCK VOID performance metrics: {metricItems.map(m => `${m.number} ${m.label}`).join(', ')}
      </p>
      <MarqueeRow items={metricNodes} direction="left" speed={40} />
      <MarqueeRow items={serviceNodes} direction="right" speed={50} />
    </section>
  )
}
