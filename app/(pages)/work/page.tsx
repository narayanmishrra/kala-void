import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work — Case Studies & Results',
  description: 'Proof over promises. Browse BLCK VOID case studies across paid advertising, web development, 3D animation, and more.',
}

export default function WorkPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <section style={{ padding: '120px 0 60px' }}>
        <div className="container-page">
          <span className="type-eyebrow">OUR WORK</span>
          <h1 className="type-heading" style={{ color: '#ffffff', marginTop: 24 }}>
            Results that<br />
            <span style={{ color: '#8052ff' }}>speak volumes.</span>
          </h1>
          <p className="type-body" style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 24 }}>
            Different industries. Different constraints. The same standard: measurable movement.
          </p>
        </div>
      </section>
      <section style={{ padding: '0 0 120px' }}>
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
            {[
              { client: 'Nova Form', industry: 'DTC / Beauty', result: '4.2× ROAS' },
              { client: 'Axis Developments', industry: 'Real Estate', result: '312% More Leads' },
              { client: 'Helix Brands', industry: 'SaaS', result: '↓ 40% CPA' },
              { client: 'Terraform Studio', industry: 'Gaming', result: '2.8× ROAS' },
            ].map((cs) => (
              <div key={cs.client}>
                <div
                  style={{
                    aspectRatio: '16/9',
                    borderRadius: 24,
                    background: 'linear-gradient(135deg, rgba(128,82,255,0.08) 0%, rgba(21,132,110,0.06) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
                <div className="mt-3"><span className="tag-outline">{cs.industry}</span></div>
                <h3 className="font-[family-name:var(--font-ppneuemontreal)] text-[27px] font-normal text-white mt-3">{cs.client}</h3>
                <p className="font-[family-name:var(--font-ppneuemontreal)] text-[36px] font-normal mt-1.5" style={{ color: '#ffb829', lineHeight: 1.2 }}>{cs.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
