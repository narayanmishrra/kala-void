import { Hero } from "@/components/sections/Hero"
import { Features } from "@/components/sections/Features"
import { Team } from "@/components/sections/Team"
import { Investors } from "@/components/sections/Investors"
import { CookieConsent } from "@/components/sections/CookieConsent"

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Team />
      <Investors />
      <CookieConsent />
    </>
  )
}
