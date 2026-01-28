// components/sample-intel-section.tsx

"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Shield, Building2, Vote, AlertTriangle } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const sampleIntel = [
  {
    date: "2026.01.26",
    category: "Crime",
    icon: Shield,
    title: "Vehicle Break-ins Spike in Crystal Lake",
    summary: "7 reported incidents on Main Street corridor this week. Police increasing overnight patrols.",
  },
  {
    date: "2026.01.24",
    category: "Development",
    icon: Building2,
    title: "Mixed-Use Project Approved",
    summary: "Planning board greenlit 120-unit development at former mall site. Construction starts Q2.",
  },
  {
    date: "2026.01.22",
    category: "Elections",
    icon: Vote,
    title: "Township Supervisor Race Heats Up",
    summary: "Third candidate enters race. Filing deadline February 15.",
  },
  {
    date: "2026.01.20",
    category: "Registry",
    icon: AlertTriangle,
    title: "Sex Offender Relocation Notice",
    summary: "New registrant within 1 mile of Lincoln Elementary. Tier II classification.",
  },
]

export function SampleIntelSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power3.out",
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener("mousemove", handleMouseMove)
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

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

      const cards = cardsRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="sample-intel" ref={sectionRef} className="relative py-32 pl-6 md:pl-28">
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-12 h-12 rounded-full border-2 border-accent bg-accent/20",
          "transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Section header */}
      <div ref={headerRef} className="mb-16 pr-6 md:pr-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Preview</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">SAMPLE INTEL</h2>
        <p className="mt-4 font-mono text-sm text-muted-foreground max-w-lg">
          A taste of what lands in your inbox every Sunday.
        </p>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={cardsRef}
        className="flex gap-6 overflow-x-auto pb-8 pr-12 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sampleIntel.map((item, index) => (
          <IntelCard key={index} item={item} index={index} />
        ))}
      </div>
    </section>
  )
}

function IntelCard({
  item,
  index,
}: {
  item: {
    date: string
    category: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    summary: string
  }
  index: number
}) {
  const Icon = item.icon

  return (
    <article
      className={cn(
        "group relative flex-shrink-0 w-80",
        "transition-transform duration-500 ease-out cursor-pointer",
        "hover:-translate-y-2"
      )}
    >
      {/* Card */}
      <div className="relative bg-card border border-border/50 p-6 h-full">
        {/* Top edge accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {item.category}
            </span>
          </div>
          <time className="font-mono text-[10px] text-muted-foreground/60">{item.date}</time>
        </div>

        {/* Title */}
        <h3 className="font-[var(--font-bebas)] text-2xl tracking-tight mb-4 group-hover:text-accent transition-colors duration-300 leading-tight">
          {item.title}
        </h3>

        {/* Divider */}
        <div className="w-8 h-px bg-accent/60 mb-4 group-hover:w-full transition-all duration-500" />

        {/* Summary */}
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          {item.summary}
        </p>

        {/* Card number */}
        <span className="absolute bottom-4 right-4 font-mono text-[10px] text-muted-foreground/30 group-hover:text-accent/50 transition-colors">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Corner fold */}
        <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
        </div>
      </div>

      {/* Shadow layer */}
      <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </article>
  )
}