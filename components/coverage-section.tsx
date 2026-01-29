// components/coverage-section.tsx
"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MapPin, ChevronRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const launchMarkets = [
  {
    id: "cook",
    name: "Cook County",
    state: "IL",
    population: "5.2M",
    municipalities: [
      "Chicago", "Evanston", "Oak Park", "Skokie", "Cicero", 
      "Arlington Heights", "Schaumburg", "Orland Park", "Tinley Park", "Oak Lawn"
    ],
  },
  {
    id: "travis",
    name: "Travis County",
    state: "TX",
    population: "1.3M",
    municipalities: [
      "Austin", "Pflugerville", "Round Rock", "Cedar Park", "Lakeway",
      "Bee Cave", "West Lake Hills", "Rollingwood", "Sunset Valley", "Manor"
    ],
  },
  {
    id: "sandiego",
    name: "San Diego County",
    state: "CA",
    population: "3.3M",
    municipalities: [
      "San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad",
      "El Cajon", "Vista", "San Marcos", "Encinitas", "National City"
    ],
  },
  {
    id: "montgomery",
    name: "Montgomery County",
    state: "MD",
    population: "1.1M",
    municipalities: [
      "Bethesda", "Silver Spring", "Rockville", "Gaithersburg", "Germantown",
      "Wheaton", "Potomac", "Olney", "Takoma Park", "Chevy Chase"
    ],
  },
]

export function CoverageSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("cook")

  const activeMarket = launchMarkets.find(m => m.id === activeTab)!

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      )

      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="coverage" className="relative py-16 md:py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-10 md:mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Launch Markets</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-7xl tracking-tight">WHERE WE'RE STARTING</h2>
        <p className="mt-4 font-mono text-sm text-muted-foreground max-w-lg">
          Over 10 million residents across four major metro areas. 
          A lot happens every day — we help you keep up.
        </p>
      </div>

      <div ref={contentRef}>
        {/* County tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {launchMarkets.map((market) => (
            <button
              key={market.id}
              onClick={() => setActiveTab(market.id)}
              className={cn(
                "px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300 border",
                activeTab === market.id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border/40 hover:border-accent/50 hover:text-foreground"
              )}
            >
              {market.name}, {market.state}
            </button>
          ))}
        </div>

        {/* Active county content */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Left - County info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-accent" />
              <h3 className="font-[var(--font-bebas)] text-3xl md:text-5xl tracking-tight">
                {activeMarket.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-6 mb-8">
              <div>
                <span className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight">
                  {activeMarket.population}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-2">
                  residents
                </span>
              </div>
              <div className="w-px h-8 bg-border/40" />
              <div>
                <span className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight">
                  {activeMarket.municipalities.length}+
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-2">
                  municipalities
                </span>
              </div>
            </div>

            {/* Expansion note */}
            <a 
              href="/request-coverage" 
              className="block border border-border/40 p-5 hover:border-accent/50 transition-colors group"
            >
              <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-2">
                Not in these counties?
              </h4>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/70 transition-colors">
                Request coverage in your area →
              </p>
            </a>
          </div>

          {/* Right - Municipalities list */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Coverage includes
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {activeMarket.municipalities.map((city, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 py-2 border-b border-border/20"
                >
                  <span className="font-mono text-[10px] text-muted-foreground/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-sm text-foreground/80">
                    {city}
                  </span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-4">
              + unincorporated {activeMarket.name}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}