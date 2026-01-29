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
    description: "Arrests, incidents, court outcomes, sex offender registry updates, and emerging patterns in your area.",
    examples: ["Police reports", "Court records", "Registry alerts"],
    size: "large" as const,
  },
  {
    icon: Building2,
    title: "Development",
    description: "Construction permits, zoning changes, and planning board decisions that affect your neighborhood.",
    examples: ["Building permits", "Rezoning", "Variances"],
    size: "small" as const,
  },
  {
    icon: Vote,
    title: "Civic",
    description: "Elections, ballot measures, liquor licenses, and local government actions.",
    examples: ["Elections", "Licenses", "Board votes"],
    size: "small" as const,
  },
  {
    icon: AlertTriangle,
    title: "Infrastructure",
    description: "311 reports, road closures, utility work, and public service updates.",
    examples: ["Road work", "Outages", "311 reports"],
    size: "small" as const,
  },
  {
    icon: FileText,
    title: "Public Records",
    description: "Property transfers, business filings, and government documents.",
    examples: ["Property sales", "Business filings", "FOIAs"],
    size: "small" as const,
  },
  {
    icon: TrendingUp,
    title: "Trends",
    description: "Patterns and changes over time — because a single incident is noise, but a pattern is signal.",
    examples: ["Crime trends", "Property values", "Growth patterns"],
    size: "wide" as const,
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

      {/* Category grid - single column mobile, complex grid on desktop */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[200px]"
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
    size: "large" | "small" | "wide"
  }
  index: number
}) {
  const [isActive, setIsActive] = useState(false)
  const Icon = category.icon

  // Desktop span classes based on size
  const sizeClasses = {
    large: "md:col-span-2 md:row-span-2",
    small: "md:col-span-1 md:row-span-1",
    wide: "sm:col-span-2 md:col-span-2 md:row-span-1",
  }

  return (
    <article
      className={cn(
        "group relative border border-border/40 p-4 md:p-5 flex flex-col transition-all duration-500 cursor-pointer overflow-hidden",
        sizeClasses[category.size],
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
      <div className="relative z-10 flex items-center gap-3">
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0 transition-colors duration-300",
          isActive ? "text-accent" : "text-muted-foreground"
        )} />
        <h3 className={cn(
          "font-[var(--font-bebas)] text-xl sm:text-2xl md:text-3xl tracking-tight transition-colors duration-300",
          isActive ? "text-accent" : "text-foreground"
        )}>
          {category.title}
        </h3>
      </div>

      {/* Description - hidden on mobile for small cards */}
      <p className={cn(
        "relative z-10 mt-3 font-mono text-[11px] md:text-xs text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none",
        category.size === "small" ? "hidden sm:block" : ""
      )}>
        {category.description}
      </p>

      {/* Example tags - always visible, fewer on mobile for small cards */}
      <div className="relative z-10 mt-2 md:mt-3 flex flex-wrap gap-1">
        {category.examples.slice(0, category.size === "small" ? 2 : 3).map((example, i) => (
          <span
            key={i}
            className="font-mono text-[8px] md:text-[9px] uppercase tracking-wider px-1.5 md:px-2 py-0.5 md:py-1 bg-accent/10 text-accent border border-accent/20 whitespace-nowrap"
          >
            {example}
          </span>
        ))}
      </div>

      {/* Index marker */}
      <span className={cn(
        "absolute bottom-3 md:bottom-4 right-3 md:right-4 font-mono text-[10px] transition-colors duration-300",
        isActive ? "text-accent" : "text-muted-foreground/40"
      )}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Corner line */}
      <div className={cn(
        "absolute top-0 right-0 w-8 md:w-12 h-8 md:h-12 transition-all duration-500",
        isActive ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute top-0 right-0 w-full h-[2px] bg-accent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-accent" />
      </div>
    </article>
  )
}