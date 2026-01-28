// components/intel-pipeline-section.tsx

"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Radio, Map, FileText, Filter, Bell, ChevronRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const pipelineSteps = [
  {
    step: "01",
    title: "INGEST",
    description: "We pull from authoritative public sources — no scraping social media or unreliable feeds.",
    sources: [
      { icon: Radio, label: "Police Scanners" },
      { icon: Map, label: "County GIS" },
      { icon: FileText, label: "Court Records" },
    ],
  },
  {
    step: "02",
    title: "FILTER",
    description: "Our analysts verify, deduplicate, and contextualize every item before it reaches you.",
    sources: [
      { icon: Filter, label: "Deduplication" },
      { icon: FileText, label: "Verification" },
      { icon: Map, label: "Geolocation" },
    ],
  },
  {
    step: "03",
    title: "ALERT",
    description: "You get a clean, actionable briefing — not a firehose of raw data.",
    sources: [
      { icon: Bell, label: "Weekly Digest" },
      { icon: Map, label: "Your Radius" },
      { icon: FileText, label: "Context Added" },
    ],
  },
]

export function IntelPipelineSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const exampleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !stepsRef.current) return

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

      const steps = stepsRef.current?.querySelectorAll(".pipeline-step")
      if (steps) {
        gsap.fromTo(
          steps,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        )
      }

      if (exampleRef.current) {
        gsap.fromTo(
          exampleRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: exampleRef.current,
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
    <section id="intel-pipeline" ref={sectionRef} className="relative py-16 md:py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-12 md:mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / The Pipeline</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-7xl tracking-tight">HOW WE GET IT</h2>
        <p className="mt-4 font-mono text-sm text-muted-foreground max-w-lg">
          No black-box AI. No social media scraping. Just verified public records, processed by humans.
        </p>
      </div>

      {/* Pipeline steps */}
      <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 mb-12 md:mb-16">
        {pipelineSteps.map((step, index) => (
          <div key={step.step} className="pipeline-step relative">
            {/* Connector arrow - desktop only */}
            {index < pipelineSteps.length - 1 && (
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="w-8 h-8 text-accent/40" />
              </div>
            )}
            
            {/* Connector arrow - mobile only */}
            {index < pipelineSteps.length - 1 && (
              <div className="flex md:hidden justify-center py-4">
                <ChevronRight className="w-6 h-6 text-accent/40 rotate-90" />
              </div>
            )}

            <div className={cn(
              "relative bg-card border border-border/50 p-6 h-full",
              "transition-all duration-300",
              "hover:border-accent/50"
            )}>
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />

              {/* Step number */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[10px] text-accent">{step.step}</span>
                <div className="flex-1 h-px bg-border/30" />
              </div>

              {/* Title */}
              <h3 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Source icons */}
              <div className="space-y-3">
                {step.sources.map((source, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <source.icon className="w-4 h-4 text-accent/70" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {source.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Example output */}
      <div ref={exampleRef} className="max-w-2xl">
        <div className="relative bg-card border border-accent/30 p-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />
          
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Sample Output
            </span>
          </div>

          <h4 className="font-[var(--font-bebas)] text-2xl tracking-tight mb-2">
            New Commercial Development in Your 1-Mile Radius
          </h4>

          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            Crystal Lake Planning Commission approved a 45,000 sq ft retail development at 123 Main St. 
            Construction begins March 2026. Traffic impact study available. Property tax implications pending assessment.
          </p>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
            <span className="font-mono text-[10px] text-muted-foreground/60">Source: McHenry County GIS + Planning Board Minutes</span>
          </div>
        </div>
      </div>
    </section>
  )
}
