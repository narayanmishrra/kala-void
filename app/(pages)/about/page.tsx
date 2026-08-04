import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — The Architects of Your Growth',
  description: 'Strategy, media, design, code, and production in one focused team. No layers between the question and the person solving it.',
}

const team = [
  { name: 'Arjun Mehta', role: 'Founder & Strategy Lead', bio: 'Ten years building acquisition systems across DTC, SaaS, and real estate.' },
  { name: 'Priya Desai', role: 'Creative Director', bio: 'From 3D cinematic renders to scroll-stopping ad creative — every visual asset exists to move the metric.' },
  { name: 'Kai Nakamura', role: 'Head of Engineering', bio: 'Full-stack architect focused on performance. Ships websites that score 95+ on Lighthouse.' },
  { name: 'Amara Osei', role: 'Paid Media Lead', bio: 'Managed $5M+ in ad spend across Meta and Google. Obsessed with incrementality testing.' },
  { name: 'Leo Ferreira', role: '3D & VFX Artist', bio: 'Cinematic quality at campaign speed. From product renders to full brand animations.' },
  { name: 'Zara Khan', role: 'UX Research & Design', bio: 'Every interface decision grounded in behavioral data and conversion psychology.' },
]

export default function AboutPage() {
  return (
    <article style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <section style={{ padding: '120px 0 60px' }}>
        <div className="container-page">
          <span className="type-eyebrow">ABOUT BLCK VOID</span>
          <h1 className="type-heading-lg" style={{ color: '#ffffff', marginTop: 24 }}>
            The architects<br />
            <span style={{ color: '#8052ff' }}>of your growth.</span>
          </h1>
          <p className="type-body" style={{ color: '#bdbdbd', maxWidth: 560, marginTop: 24 }}>
            We are a performance marketing agency that believes the most powerful thing
            in design is what you remove. The void is not emptiness. It is precision.
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container-page">
          <span className="type-eyebrow">OUR MANIFESTO</span>
          <div className="mt-12 max-w-[700px]">
            <p className="type-heading-sm" style={{ color: '#ffffff', marginBottom: 32 }}>
              Traffic is not the outcome. Revenue is.
            </p>
            <p className="type-body" style={{ color: '#bdbdbd', marginBottom: 24 }}>
              Most agencies bring more activity. More channels. More campaigns.
              We bring less — and the results are louder.
            </p>
            <p className="type-body" style={{ color: '#bdbdbd', marginBottom: 24 }}>
              Every click has a job. Every pixel earns its position on the void.
              We don&apos;t fill space. We command it.
            </p>
            <p className="type-body" style={{ color: '#bdbdbd' }}>
              The constraint is the creative brief.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 0 120px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container-page">
          <span className="type-eyebrow">THE TEAM</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 mt-12">
            {team.map((member) => (
              <div key={member.name}>
                <div
                  style={{
                    aspectRatio: '3/4',
                    borderRadius: 24,
                    background: 'linear-gradient(180deg, rgba(128,82,255,0.06) 0%, rgba(0,0,0,0) 60%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="type-heading-lg" style={{ color: 'rgba(255,255,255,0.06)' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="type-label block mt-3" style={{ color: '#8052ff' }}>{member.role}</span>
                <h3 className="font-[family-name:var(--font-ppneuemontreal)] text-[27px] font-normal text-white">{member.name}</h3>
                <p className="font-[family-name:var(--font-ppneuemontreal)] text-[14px] font-normal text-[#9a9a9a] mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
