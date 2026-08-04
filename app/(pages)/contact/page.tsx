import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Start the Conversation',
  description: 'Tell us where you are, what is not working, and where you want to go. We will show you the shortest path.',
}

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', paddingTop: 120, paddingBottom: 120 }}>
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px]">
          <div>
            <span className="type-eyebrow">LET&apos;S TALK</span>
            <h1 className="type-heading-lg" style={{ color: '#ffffff', marginTop: 24 }}>
              Let&apos;s build<br />
              <span style={{ color: '#8052ff' }}>something.</span>
            </h1>
            <p className="type-body" style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 24 }}>
              One conversation. That&apos;s all it takes. Tell us where you are. We&apos;ll show you where you could be.
            </p>
            <div className="mt-12 flex flex-col gap-2">
              <span className="type-label" style={{ color: '#9a9a9a' }}>hello@blckvoid.com</span>
              <span className="type-label" style={{ color: '#9a9a9a' }}>Response within 24 hours</span>
            </div>
          </div>
          <div>
            <p className="type-body" style={{ color: '#bdbdbd' }}>
              Use the form on the homepage or email us directly. We read every message.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
