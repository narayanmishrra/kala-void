/* ============================================================
   BLCK VOID — components/sections/Footer.tsx
   ============================================================ */

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { navLinks, services } from '@/lib/tokens'
import { Link2, Globe, Mail, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 60,
        paddingBottom: 60,
      }}
    >
      <div className="container-page">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <Logo size="sm" />

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="type-nav text-[#9a9a9a] hover:text-white transition-colors duration-200"
                style={{ fontSize: 14, fontWeight: 400 }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#9a9a9a] hover:text-white transition-colors duration-200" aria-label="LinkedIn" rel="noopener noreferrer">
              <Link2 size={20} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-[#9a9a9a] hover:text-white transition-colors duration-200" aria-label="Instagram" rel="noopener noreferrer">
              <MessageCircle size={20} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-[#9a9a9a] hover:text-white transition-colors duration-200" aria-label="Behance" rel="noopener noreferrer">
              <Globe size={20} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-[#9a9a9a] hover:text-white transition-colors duration-200" aria-label="X (Twitter)" rel="noopener noreferrer">
              <Mail size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Middle row: Services */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href="/services"
              className="font-[family-name:var(--font-ppneuemontreal)] text-[12px] font-normal text-[#9a9a9a] hover:text-[#8052ff] transition-colors duration-200"
            >
              {service.name}
            </Link>
          ))}
        </div>

        {/* Bottom row */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-[family-name:var(--font-ppneuemontreal)] text-[12px] text-[#9a9a9a]">
            © {new Date().getFullYear()} BLCK VOID. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link href="#" className="font-[family-name:var(--font-ppneuemontreal)] text-[12px] text-[#9a9a9a] hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="text-[rgba(255,255,255,0.2)]">·</span>
            <Link href="#" className="font-[family-name:var(--font-ppneuemontreal)] text-[12px] text-[#9a9a9a] hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
          <span
            className="font-[family-name:var(--font-ppneuemontreal)] text-[12px] italic"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Built in the void. Delivered into the light.
          </span>
        </div>
      </div>
    </footer>
  )
}
