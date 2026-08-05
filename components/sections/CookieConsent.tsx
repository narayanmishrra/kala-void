"use client"

import { useState, useEffect } from "react"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-[#0a0a0a] border-t border-[#ffffff08]">
      <div className="container-page">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="type-body text-[#bdbdbd]">
              This website uses cookies.{" "}
              <a
                href="#cookies"
                className="text-[#8052ff] hover:text-[#9370ff] transition-colors"
              >
                Learn more about how we use Cookies
              </a>
            </p>
          </div>
          <button
            onClick={handleAccept}
            className="btn-primary whitespace-nowrap"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
