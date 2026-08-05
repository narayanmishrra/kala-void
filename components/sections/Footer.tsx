"use client"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-[60px] bg-[#000000] border-t border-[#ffffff08]">
      <div className="container-page">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8052ff] flex items-center justify-center">
              <svg
                width="16"
                height="16"
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
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/askdala"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost type-nav"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com/company/dala-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost type-nav"
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@dala.ai"
              className="btn-ghost type-nav"
            >
              Contact
            </a>
          </div>

          <p className="type-caption text-[#9a9a9a]">
            © {currentYear} Dala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
