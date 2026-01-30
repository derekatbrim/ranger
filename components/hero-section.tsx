// components/hero-section.tsx

"use client"

import { useRef, useEffect, useState } from "react"
import { SplitFlapText } from "@/components/split-flap-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import gsap from "gsap"
import { MapPin } from "lucide-react"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Tagline fade in
      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: "power3.out" }
        )
      }

      // Location badge
      if (locationRef.current) {
        gsap.fromTo(
          locationRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.8, delay: 2, ease: "power3.out" }
        )
      }

      // CTA fade in
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, delay: 2.2, ease: "power3.out" }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle waitlist signup
    console.log("Waitlist signup:", email)
    setEmail("")
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center pl-6 md:pl-28 pr-6 md:pr-12 py-24"
    >
      {/* Top bar */}
      <div className="absolute top-8 left-6 md:left-28 right-6 md:right-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            Raven
          </span>
          <span className="text-muted-foreground/40 hidden sm:inline">—</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
            Local Intelligence
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl">
        {/* Location indicator */}
        <div ref={locationRef} className="flex items-center gap-2 mb-6 opacity-0">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Launching in 4 counties
          </span>
        </div>

        {/* Main headline with split-flap */}
        <div className="mb-8">
          <SplitFlapText text="RANGER" className="tracking-tight" speed={45} />
        </div>

        {/* Tagline */}
        <div ref={taglineRef} className="mb-8 md:mb-12 opacity-0">
          <p className="font-mono text-lg md:text-xl text-foreground/90 max-w-xl leading-relaxed">
            Local intelligence for the modern neighbor.
          </p>
          <p className="font-mono text-sm text-muted-foreground mt-4 max-w-lg leading-relaxed">
            Crime, development, civic records, and more — synthesized into a calm, 
            verified briefing so you actually know what's happening in your county.
          </p>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="opacity-0">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-card border border-border/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Become a Founding Member
              <BitmapChevron className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
          <p className="font-mono text-[10px] text-muted-foreground mt-4 uppercase tracking-wider">
            Get your first briefing free • No spam • Unsubscribe anytime
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-6 md:left-28 flex items-center gap-4">
        <div className="w-[1px] h-16 bg-gradient-to-b from-accent to-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left translate-y-6">
          Scroll
        </span>
      </div>

      {/* Corner decoration */}
      <div className="absolute top-8 right-6 md:right-12 w-24 h-24 pointer-events-none hidden md:block">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-border/40" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-border/40" />
      </div>
    </section>
  )
}