"use client"

import { useEffect, useState } from "react"
import ParticleField from "@/components/canvas/ParticleField"

export function Hero() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background - Dala-style organic brain animation */}
      <ParticleField />

      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(128, 82, 255, 0.05) 0%, transparent 70%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-page text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <span className="type-nav text-[#9a9a9a]">LOADING</span>
            <div className="w-64 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8052ff] transition-all duration-300 ease-out"
                style={{ width: `${Math.min(loadProgress, 100)}%` }}
              />
            </div>
            <span className="type-body text-[#bdbdbd]">
              {Math.round(Math.min(loadProgress, 100))}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-fadeIn">
            <p className="type-heading-sm text-[#bdbdbd]">
              Your workplace has the answer.
            </p>
            <h1 className="type-display text-[#ffffff] max-w-4xl leading-[1.05]">
              Ask Dala to find it.
            </h1>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
