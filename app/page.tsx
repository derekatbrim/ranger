// app/page.tsx

import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { CoverageSection } from "@/components/coverage-section"
import { SampleIntelSection } from "@/components/sample-intel-section"
import { FooterSection } from "@/components/footer-section"
import { SideNav } from "@/components/side-nav"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <SideNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <HeroSection />
        <CategoriesSection />
        <HowItWorksSection />
        <CoverageSection />
        <SampleIntelSection />
        <FooterSection />
      </div>
    </main>
  )
}