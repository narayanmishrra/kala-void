import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Insights & Strategy',
  description: 'Performance marketing insights, growth strategies, and digital production thinking from the BLCK VOID team.',
}

const posts = [
  { date: '2024.12.15', title: 'Why Your Meta Ads Are Burning Budget (And How to Fix It)', category: 'PAID ADS' },
  { date: '2024.11.28', title: 'The Landing Page Is Not Dead — It Is Underengineered', category: 'WEB DEV' },
  { date: '2024.11.10', title: '3D in Performance Marketing: From Gimmick to Revenue', category: '3D / VFX' },
  { date: '2024.10.22', title: 'WhatsApp as a Conversion Channel: The Data No One Is Showing You', category: 'WHATSAPP' },
]

export default function BlogPage() {
  return (
    <article style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <section style={{ padding: '120px 0 60px' }}>
        <div className="container-page">
          <span className="type-eyebrow">BLOG</span>
          <h1 className="type-heading" style={{ color: '#ffffff', marginTop: 24 }}>
            Signal over<br />
            <span style={{ color: '#8052ff' }}>noise.</span>
          </h1>
        </div>
      </section>
      <section style={{ padding: '0 0 120px' }}>
        <div className="container-page flex flex-col">
          {posts.map((post) => (
            <div
              key={post.title}
              className="grid items-center py-6 gap-6 border-b border-[rgba(255,255,255,0.08)]"
              style={{ gridTemplateColumns: '100px 1fr auto' }}
            >
              <span className="font-[family-name:var(--font-ppneuemontreal)] text-[14px] text-[#9a9a9a]">{post.date}</span>
              <h2 className="font-[family-name:var(--font-ppneuemontreal)] text-[24px] font-normal text-white hover:text-[#8052ff] transition-colors duration-200 cursor-pointer" style={{ letterSpacing: '-0.48px' }}>
                {post.title}
              </h2>
              <span className="tag-outline">{post.category}</span>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
