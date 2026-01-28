// components/side-nav.tsx

"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

const navItems = [
  { id: "hero", label: "Home" },
  { id: "categories", label: "Coverage" },
  { id: "how-it-works", label: "Process" },
  { id: "coverage", label: "Area" },
  { id: "sample-intel", label: "Preview" },
  { id: "footer", label: "Contact" },
]

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop side nav */}
      <nav className="fixed left-0 top-0 z-50 h-screen w-16 md:w-20 hidden md:flex flex-col justify-center border-r border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col gap-6 px-4">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="group relative flex items-center gap-3 cursor-pointer"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  activeSection === id ? "bg-accent scale-125" : "bg-muted-foreground/40 group-hover:bg-foreground/60"
                )}
              />
              <span
                className={cn(
                  "absolute left-6 font-mono text-[10px] uppercase tracking-widest opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:left-8 whitespace-nowrap",
                  activeSection === id ? "text-accent" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-6 right-6 z-50 md:hidden w-12 h-12 flex items-center justify-center border border-border/50 bg-background/80 backdrop-blur-sm cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "fixed inset-0 z-[100] md:hidden transition-all duration-500",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(to right, oklch(0.2 0 0) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.2 0 0) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center border border-border/50 bg-card cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Menu content */}
        <div className="relative h-full flex flex-col justify-center px-8">
          {/* Brand */}
          <div className="absolute top-8 left-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Ranger</span>
          </div>

          {/* Navigation items */}
          <nav className="space-y-2">
            {navItems.map(({ id, label }, index) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  "group flex items-center gap-6 w-full text-left py-4 cursor-pointer",
                  "transition-all duration-300",
                  mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                )}
                style={{ transitionDelay: mobileMenuOpen ? `${index * 75}ms` : "0ms" }}
              >
                <span className="font-mono text-[10px] text-muted-foreground/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-[var(--font-bebas)] text-5xl tracking-tight transition-colors duration-200",
                    activeSection === id ? "text-accent" : "text-foreground group-hover:text-accent"
                  )}
                >
                  {label.toUpperCase()}
                </span>
              </button>
            ))}
          </nav>

          {/* Bottom info */}
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Local Intelligence
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                McHenry County, IL
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-accent uppercase tracking-wider">
                Join Waitlist
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}