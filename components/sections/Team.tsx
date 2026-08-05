"use client"

import { useState, useEffect, useCallback } from "react"

interface TeamMember {
  name: string
  role: string
  image: string
  twitter: string
  linkedin: string
}

const teamMembers: TeamMember[] = [
  {
    name: "Haroun Hickman",
    role: "Co Founder & CEO",
    image: "https://dala.craftedbygc.com/images/team/haroun.jpg",
    twitter: "https://twitter.com/HarounHickman",
    linkedin: "https://www.linkedin.com/in/harounhickman",
  },
  {
    name: "Poppy Reid",
    role: "Product Design Lead",
    image: "https://dala.craftedbygc.com/images/team/poppy.jpg",
    twitter: "https://twitter.com/ReidPoppy",
    linkedin: "https://www.linkedin.com/in/poppy-reid-484087121",
  },
  {
    name: "Joel Kang",
    role: "Co Founder & CTO",
    image: "https://dala.craftedbygc.com/images/team/joel.jpg",
    twitter: "https://twitter.com/_joel_kang_",
    linkedin: "https://www.linkedin.com/in/joelkang",
  },
]

export function Team() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % teamMembers.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  return (
    <section id="team" className="py-[120px] bg-[#000000]">
      <div className="container-page">
        <h2 className="type-heading-lg text-[#ffffff] mb-[60px]">
          Our team
        </h2>

        {/* Team Carousel */}
        <div
          className="mb-[60px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 flex justify-center"
                >
                  <div className="flex flex-col items-center gap-8">
                    <div className="w-48 h-48 rounded-full overflow-hidden bg-[#1a1a1a]">
                      <img
                        src={member.image}
                        alt={`Portrait of ${member.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="type-eyebrow mb-2">{member.role}</p>
                      <h3 className="type-heading-sm text-[#ffffff]">{member.name}</h3>
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost"
                        >
                          Twitter
                        </a>
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost"
                        >
                          Linkedin
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <button
              onClick={prevSlide}
              className="btn-ghost type-nav"
              aria-label="Previous team member"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "bg-[#8052ff] w-8"
                      : "bg-[#9a9a9a] hover:bg-[#bdbdbd]"
                  }`}
                  aria-label={`Go to team member ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="btn-ghost type-nav"
              aria-label="Next team member"
            >
              Next
            </button>
          </div>
        </div>

        {/* All Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[60px] mb-[120px]">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[#1a1a1a] mb-6">
                <img
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="type-eyebrow mb-2">{member.role}</p>
              <h3 className="type-heading-xs text-[#ffffff] mb-4">{member.name}</h3>
              <div className="flex items-center gap-4">
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Twitter
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Linkedin
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Build with us */}
        <div className="max-w-3xl mx-auto text-center mb-[120px]">
          <h3 className="type-heading text-[#ffffff] mb-6">
            Build with us.
          </h3>
          <p className="type-body text-[#bdbdbd] mb-6">
            We are actively hiring intentional, empathetic and curious people who thrive on creating delightful experiences. If you'd like to be a part of the journey, email <a href="mailto:careers@dala.ai" className="text-[#8052ff] hover:text-[#9370ff] transition-colors">careers@dala.ai</a> with your CV or portfolio, and a thoughtful note.
          </p>
          <a
            href="https://medium.com/dala-ai/why-we-wrote-our-values-before-we-wrote-a-single-line-of-code-99ada8a18cd5"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Read more about our values here.
          </a>
        </div>
      </div>
    </section>
  )
}
