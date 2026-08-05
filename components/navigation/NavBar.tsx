"use client"

import { useState, useEffect } from "react"

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#000000e6] backdrop-blur-md" : "bg-transparent"
      }`}
      style={{ height: 72 }}
    >
      <div className="container-page h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#8052ff] flex items-center justify-center transition-transform group-hover:scale-105">
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="3" fill="white" />
                <circle cx="4" cy="6" r="1.5" fill="white" />
                <circle cx="12" cy="6" r="1.5" fill="white" />
                <circle cx="6" cy="11" r="1.5" fill="white" />
                <circle cx="10" cy="11" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="type-nav text-[#ffffff]">DALA</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="btn-ghost type-nav">
              Features
            </a>
            <a href="#team" className="btn-ghost type-nav">
              Team
            </a>
            <a href="#investors" className="btn-ghost type-nav">
              Investors
            </a>
            <a
              href="https://askdala.typeform.com/to/lSujgyr8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Request Access
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`w-6 h-0.5 bg-[#ffffff] transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[#ffffff] transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[#ffffff] transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-[#000000] border-t border-[#ffffff08] transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="container-page py-6 flex flex-col gap-4">
            <a
              href="#features"
              className="btn-ghost type-nav py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#team"
              className="btn-ghost type-nav py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Team
            </a>
            <a
              href="#investors"
              className="btn-ghost type-nav py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Investors
            </a>
            <a
              href="https://askdala.typeform.com/to/lSujgyr8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Request Access
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
