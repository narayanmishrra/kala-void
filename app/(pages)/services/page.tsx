import type { Metadata } from 'next'
import { services } from '@/lib/tokens'

export const metadata: Metadata = {
  title: 'Services — Full-Service Performance Marketing',
  description: 'Meta & Google Ads, Lead Generation, Web Development, 3D Animation & VFX, UI/UX Design, WhatsApp Marketing.',
}

export default function ServicesPage() {
  return (
    <article style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <section style={{ padding: '120px 0 60px' }}>
        <div className="container-page">
          <span className="type-eyebrow">WHAT WE DO</span>
          <h1 className="type-heading-lg" style={{ color: '#ffffff', marginTop: 24 }}>
            Every channel.<br />
            <span style={{ color: '#8052ff' }}>Mastered.</span>
          </h1>
          <p className="type-body" style={{ color: '#bdbdbd', maxWidth: 560, marginTop: 24 }}>
            We don&apos;t sell services. We build systems. Each discipline in our stack is
            engineered to compound — your paid ads informed by your landing page data,
            your 3D assets redeployed across every touchpoint.
          </p>
        </div>
      </section>

      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          style={{
            backgroundColor: '#000000',
            padding: '120px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="container-page">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-start">
              <div>
                <span className="type-label" style={{ color: '#ffb829' }}>{service.number}</span>
                <h2 className="type-heading-sm" style={{ color: '#ffffff', marginTop: 16 }}>
                  {service.name}
                </h2>
                <p className="type-body" style={{ color: '#9a9a9a', maxWidth: 480, marginTop: 24 }}>
                  {service.description}
                </p>
                <div style={{ marginTop: 36 }}>
                  <span className="tag-outline">{service.deliverable}</span>
                </div>
                <div style={{ marginTop: 36 }}>
                  <a href="/contact" className="btn-primary inline-flex">
                    Start a {service.shortName} Project
                  </a>
                </div>
              </div>
              <div
                aria-hidden="true"
                style={{
                  aspectRatio: '4/3',
                  backgroundColor: 'rgba(128,82,255,0.05)',
                  borderRadius: 24,
                  border: '1px solid rgba(128,82,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 72, fontWeight: 400, color: 'rgba(128,82,255,0.15)', letterSpacing: '-3px' }}>
                  {service.number}
                </span>
              </div>
            </div>
          </div>
        </section>
      ))}
    </article>
  )
}
