// components/footer-section.tsx

"use client"

import { useRef, useEffect, useState } from "react"
import { BitmapChevron } from "@/components/bitmap-chevron"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
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
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Footer waitlist signup:", email)
    setEmail("")
  }

  return (
    <section
      ref={sectionRef}
      id="footer"
      className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 border-t border-border/30"
    >
      <div ref={contentRef}>
        {/* Main CTA */}
        <div className="max-w-2xl mb-24">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Get Started</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
            KNOW YOUR COUNTY
          </h2>
          <p className="mt-6 font-mono text-sm text-muted-foreground leading-relaxed max-w-lg">
            Join the waitlist for early access to Raven. Be the first to get weekly intelligence 
            briefings for McHenry County.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mt-8">
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
              Join Waitlist
              <BitmapChevron className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Product */}
          <div className="col-span-1">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">Features</li>
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">Pricing</li>
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">Coverage</li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">About</li>
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">Blog</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">Privacy</li>
              <li className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer">Terms</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@ranger.local"
                  className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors cursor-pointer"
                >
                  Twitter/X
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            © 2026 Raven. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            Local intelligence for the modern neighbor.
          </p>
        </div>
      </div>
    </section>
  )
}