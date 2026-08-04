/* ============================================================
   BLCK VOID — components/navigation/NavBar.tsx
   ============================================================ */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { navLinks } from '@/lib/tokens'
import { mobileMenuOverlay, mobileMenuLink, mobileMenuContainer } from '@/lib/animations'
import { cn } from '@/lib/cn'

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        )}
        style={{
          height: 72,
          backgroundColor: scrolled ? 'rgba(0,0,0,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        }}
      >
        <nav
          aria-label="Main navigation"
          className="container-page flex items-center justify-between h-full"
        >
          <Logo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-[30px]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'type-nav relative',
                    isActive ? 'text-white' : 'text-[#9a9a9a] hover:text-white',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ transition: 'color 200ms ease' }}
                >
                  {link.label}
                  <span
                    className="absolute bottom-[-4px] left-0 h-[1px] bg-[#8052ff] origin-left scale-x-0 hover:scale-x-100 transition-transform duration-200"
                    style={{ width: '100%' }}
                  />
                </Link>
              )
            })}
          </div>

          {/* Desktop CTA */}
          <Link
            href="/contact"
            className="btn-primary hidden md:inline-flex"
          >
            Get Results
          </Link>

          {/* Mobile menu trigger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black flex flex-col"
            variants={mobileMenuOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 h-16">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-10 h-10 text-white"
                aria-label="Close navigation menu"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Links */}
            <motion.div
              className="flex-1 flex flex-col justify-center px-6 gap-[18px]"
              variants={mobileMenuContainer}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={mobileMenuLink}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block font-[family-name:var(--font-ppneuemontreal)] text-[48px] font-normal leading-[0.95] tracking-[-1.5px] text-white hover:text-[#8052ff] transition-colors duration-200"
                    style={{ fontFamily: 'var(--font-ppneuemontreal)' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile CTA */}
            <div className="px-6 pb-8">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                Get Results
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
