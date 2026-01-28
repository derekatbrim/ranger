// components/categories-section.tsx

"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Shield, Building2, Vote, AlertTriangle, FileText, TrendingUp } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const categories = [
  {
    icon: Shield,
    title: "Crime & Safety",
    description: "Arrests, incidents, court outcomes, and emerging patterns in your area.",
    examples: ["DUI checkpoints", "Vehicle break-ins", "Court dispositions"],
    span: "col-span-2 row-span-2",
  },
  {
    icon: Building2,
    title: "Development",
    description: "Construction permits, zoning changes, and planning board decisions.",
    examples: ["New construction", "Rezoning requests", "Variance approvals"],
    span: "col-span-1 row-span-1",
  },
  {
    icon: Vote,
    title: "Elections",
    description: "Candidates, ballot measures, polling locations, and results.",
    examples: ["Candidate filings", "Ballot measures", "Election results"],
    span: "col-span-1 row-span-1",
  },
  {
    icon: AlertTriangle,
    title: "Sex Offenders",
    description: "Registry updates, relocations, and proximity alerts.",
    examples: ["New registrations", "Address changes", "School proximity"],
    span: "col-span-1 row-span-1",
  },
  {
    icon: FileText,
    title: "Public Records",
    description: "Business licenses, property transfers, and government filings.",
    examples: ["Liquor licenses", "Property sales", "FOIAs"],
    span: "col-span-1 row-span-1",
  },
  {
    icon: TrendingUp,
    title: "Trends",
    description: "Patterns and changes over time that matter to residents.",
    examples: ["Crime trends", "Property values", "Population shifts"],
    span: "col-span-2 row-span-1",
  },
]

export function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Header animation
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

      // Grid items stagger
      const items = gridRef.current?.querySelectorAll("article")
      if (items) {
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="categories" ref={sectionRef} className="relative py-16 md:py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-10 md:mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Coverage</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-7xl tracking-tight">WHAT WE TRACK</h2>
      </div>

      {/* Category grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px] max-w-6xl"
      >
        {categories.map((category, index) => (
          <CategoryCard key={index} category={category} index={index} />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  index,
}: {
  category: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    examples: string[]
    span: string
  }
  index: number
}) {
  const [isActive, setIsActive] = useState(false)
  const Icon = category.icon

  return (
    <article
      className={cn(
        "group relative border border-border/40 p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        category.span,
        isActive && "border-accent/60"
      )}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
      onTouchCancel={() => setIsActive(false)}
    >
      {/* Background layer */}
      <div
        className={cn(
          "absolute inset-0 bg-accent/5 transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "p-2 border transition-all duration-300",
            isActive ? "border-accent bg-accent/10" : "border-border/40"
          )}>
            <Icon className={cn(
              "w-5 h-5 transition-colors duration-300",
              isActive ? "text-accent" : "text-muted-foreground"
            )} />
          </div>
          <h3 className={cn(
            "font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight transition-colors duration-300 pt-1",
            isActive ? "text-accent" : "text-foreground"
          )}>
            {category.title}
          </h3>
        </div>
      </div>

      {/* Description - reveals on hover/touch */}
      <div className="relative z-10">
        <p className={cn(
          "font-mono text-xs text-muted-foreground leading-relaxed transition-all duration-500 mb-4",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          {category.description}
        </p>

        {/* Example tags */}
        <div className={cn(
          "flex flex-wrap gap-2 transition-all duration-500",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          {category.examples.map((example, i) => (
            <span
              key={i}
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-accent/10 text-accent border border-accent/20"
            >
              {example}
            </span>
          ))}
        </div>
      </div>

      {/* Index marker */}
      <span className={cn(
        "absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300",
        isActive ? "text-accent" : "text-muted-foreground/40"
      )}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Corner line */}
      <div className={cn(
        "absolute top-0 right-0 w-12 h-12 transition-all duration-500",
        isActive ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute top-0 right-0 w-full h-[2px] bg-accent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-accent" />
      </div>
    </article>
  )
}