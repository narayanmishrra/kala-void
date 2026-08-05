"use client"

interface Investor {
  name: string
  logo: string
  description?: string
}

const investors: Investor[] = [
  {
    name: "Seedcamp",
    logo: "https://dala.craftedbygc.com/images/investors/1.png",
  },
  {
    name: "James Meekings",
    logo: "https://dala.craftedbygc.com/images/investors/2.png",
    description: "Co-founder of Funding Circle",
  },
  {
    name: "Evening Fund",
    logo: "https://dala.craftedbygc.com/images/investors/3.png",
  },
  {
    name: "Valia Ventures",
    logo: "https://dala.craftedbygc.com/images/investors/4.png",
  },
  {
    name: "Roman Schumacher",
    logo: "https://dala.craftedbygc.com/images/investors/5.png",
    description: "Co-founder & CPO at Personio",
  },
]

export function Investors() {
  return (
    <section id="investors" className="py-[120px] bg-[#000000]">
      <div className="container-page">
        <div className="text-center mb-[60px]">
          <h2 className="type-heading-lg text-[#ffffff] mb-6">
            Our investors
          </h2>
          <p className="type-body text-[#bdbdbd] max-w-2xl mx-auto">
            We are supported by some of the world's most pioneering operators and progressive funds to fuel our growth.
          </p>
        </div>

        {/* Investor logos */}
        <div className="flex flex-wrap justify-center items-center gap-[60px] mb-[60px]">
          {investors.map((investor, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-32 h-16 flex items-center justify-center bg-[#0a0a0a] rounded-lg p-4">
                <img
                  src={investor.logo}
                  alt={investor.name}
                  className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="text-center">
                <p className="type-nav text-[#bdbdbd]">{investor.name}</p>
                {investor.description && (
                  <p className="type-caption text-[#9a9a9a] mt-1">
                    {investor.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
