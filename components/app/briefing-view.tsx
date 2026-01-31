// components/app/briefing-view.tsx
"use client"

import { useState } from "react"
import { 
  CURRENT_LOCATION, 
  ORBIT_LOCATIONS,
  type LocationData
} from "@/lib/raven-data"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Construction,
  Landmark,
  Clock,
  Shield,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Zap,
  Map
} from "lucide-react"

// ============================================
// GET TIME-BASED GREETING
// ============================================
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// ============================================
// SCORE HERO - Prominent, not hidden
// ============================================
function ScoreHero({ location }: { location: LocationData }) {
  const TrendIcon = location.trend === "improving" 
    ? TrendingUp 
    : location.trend === "declining"
    ? TrendingDown
    : Minus
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-600"
    : location.trend === "declining"
    ? "text-rose-600"
    : "text-muted-foreground"

  const greeting = getGreeting()
  // TODO: Replace with actual user name from auth
  const userName = "Derek"

  return (
    <div className="mb-8">
      {/* Greeting */}
      <h1 className="font-[family-name:var(--font-bebas)] text-3xl md:text-4xl tracking-tight text-foreground mb-1">
        {greeting}, {userName}
      </h1>
      
      {/* Location and date */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          Raven Brief
        </span>
        <span className="text-border">—</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {location.name}
        </span>
        <span className="text-border hidden sm:inline">—</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Score and narrative side by side */}
      <div className="flex items-start gap-8">
        {/* Score - prominent with gradient */}
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl md:text-7xl font-light tracking-tight bg-gradient-to-br from-accent via-orange-500 to-amber-500 bg-clip-text text-transparent">
              {location.stabilityScore}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 mt-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="font-mono text-xs">
              {location.trendPercent > 0 ? "+" : ""}{location.trendPercent}% vs last week
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
            Stability Index
          </p>
        </div>

        {/* Narrative */}
        <div className="flex-1 pt-2">
          <p className="font-mono text-sm md:text-base text-foreground/80 leading-relaxed">
            Activity in {location.name} remains <span className="text-foreground font-medium">{location.trend}</span> this week. 
            Property incidents are concentrated overnight in the downtown corridor — a pattern now in its third week. 
            Infrastructure disruptions on Route 14 continue through Friday. No significant civic changes pending.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CARD WRAPPER - Reusable hover effect
// ============================================
function IntelCard({ 
  children, 
  variant = "default",
  onClick
}: { 
  children: React.ReactNode
  variant?: "default" | "primary" | "quiet"
  onClick?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const baseStyles = "relative border transition-all duration-300 cursor-pointer overflow-hidden"
  
  const variantStyles = {
    default: `border-border/40 ${isHovered ? "border-accent/50" : ""}`,
    primary: "border-accent/30",
    quiet: `border-border/30 bg-muted/30 ${isHovered ? "border-emerald-500/50" : ""}`
  }

  return (
    <article
      className={`${baseStyles} ${variantStyles[variant]} p-5 md:p-6`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Top accent for primary variant */}
      {variant === "primary" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />
      )}

      {/* Hover background */}
      <div 
        className={`absolute inset-0 bg-accent/5 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} 
      />

      {/* Corner decoration on hover */}
      <div className={`absolute top-0 right-0 w-10 h-10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute top-0 right-0 w-full h-[2px] bg-accent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-accent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Click indicator */}
      <ChevronRight className={`absolute bottom-4 right-4 w-4 h-4 transition-all duration-300 ${isHovered ? "text-accent translate-x-0 opacity-100" : "text-transparent -translate-x-2 opacity-0"}`} />
    </article>
  )
}

// ============================================
// RAVEN ANALYSIS - Primary Card
// ============================================
function RavenAnalysisCard({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <IntelCard variant="primary" onClick={onOpenModal}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-accent/10">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Emerging Pattern
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Raven Analysis
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-bebas)] text-2xl md:text-4xl tracking-tight text-foreground mb-3">
            Vehicle Break-ins — Downtown Corridor
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-1.5 text-rose-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-xs font-medium">↑ 23% over 3 weeks</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">11pm – 3am window</span>
            <span className="font-mono text-xs text-muted-foreground">Main St area</span>
          </div>

          <p className="font-mono text-sm text-foreground/70 leading-relaxed">
            <span className="text-foreground font-medium">What this means for you:</span> Avoid leaving valuables visible in vehicles parked overnight near downtown. Police have increased patrols.
          </p>
        </div>
      </div>
    </IntelCard>
  )
}

// ============================================
// ACTIVE CONDITIONS
// ============================================
function ActiveConditionsCard({ onOpenModal }: { onOpenModal: () => void }) {
  const conditions = [
    {
      icon: Construction,
      title: "Route 14 Eastbound Closure",
      detail: "Water main repair • Expect 15-20 min delays",
      timeline: "Through Friday",
      severity: "moderate"
    },
    {
      icon: AlertTriangle,
      title: "Street Light Outage — Walkup Ave",
      detail: "ComEd dispatched",
      timeline: "Est. tomorrow",
      severity: "low"
    }
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold">
          Active Conditions
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {conditions.length} disruption{conditions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {conditions.map((condition, i) => (
          <div key={i} className={`flex items-start gap-3 ${i > 0 ? "pt-4 border-t border-border/30" : ""}`}>
            <condition.icon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-mono text-sm font-semibold text-foreground">{condition.title}</h4>
                <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{condition.timeline}</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{condition.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// CIVIC SIGNALS
// ============================================
function CivicSignalsCard({ onOpenModal }: { onOpenModal: () => void }) {
  const signals = [
    {
      title: "Commercial Rezoning Approved",
      impact: "Virginia St corridor may see retail expansion",
      date: "Feb 15"
    },
    {
      title: "Mixed-Use Development Filed",
      impact: "150 units + retail proposed downtown",
      date: "Hearing Mar 5"
    }
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <Landmark className="w-4 h-4 text-sky-500" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-sky-600 font-semibold">
          Civic Signals
        </span>
      </div>

      <div className="space-y-4">
        {signals.map((signal, i) => (
          <div key={i} className={i > 0 ? "pt-4 border-t border-border/30" : ""}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-mono text-sm font-semibold text-foreground">{signal.title}</h4>
              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{signal.date}</span>
            </div>
            <p className="font-mono text-xs text-foreground/60">{signal.impact}</p>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// WHAT'S QUIET
// ============================================
function WhatsQuietCard({ onOpenModal }: { onOpenModal: () => void }) {
  const quietItems = [
    "Violent crime at historic lows",
    "Residential areas stable",
    "School zones clear this week"
  ]

  return (
    <IntelCard variant="quiet" onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
          What's Quiet
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {quietItems.map((item, i) => (
          <span 
            key={i} 
            className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/70 bg-emerald-500/10 px-2.5 py-1.5 rounded"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {item}
          </span>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// TEMPORAL PATTERNS
// ============================================
function TemporalPatternsCard({ onOpenModal }: { onOpenModal: () => void }) {
  const windows = [
    { label: "Higher Activity", time: "11PM – 2AM", color: "text-rose-600", note: "Property incidents cluster here" },
    { label: "Rush Impact", time: "5PM – 7PM", color: "text-amber-600", note: "Route 14 delays" },
    { label: "Quietest", time: "3AM – 7AM", color: "text-emerald-600", note: "Consistently low" }
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          When Things Happen
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {windows.map((window, i) => (
          <div key={i} className="text-center">
            <p className={`font-mono text-lg font-medium ${window.color}`}>{window.time}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{window.label}</p>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// MAP PREVIEW CARD
// ============================================
function MapPreviewCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  return (
    <IntelCard onClick={onNavigateToMap}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Map className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Activity Map
          </span>
        </div>
        <span className="font-mono text-[10px] text-accent flex items-center gap-1">
          Open full map <ExternalLink className="w-3 h-3" />
        </span>
      </div>

      {/* Mini map visualization */}
      <div className="relative h-32 bg-muted/30 rounded overflow-hidden">
        <svg viewBox="0 0 300 120" className="w-full h-full">
          <defs>
            <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border"/>
            </pattern>
            <radialGradient id="hotspot1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="rgb(244, 63, 94)" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hotspot2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="300" height="120" fill="url(#mapGrid)"/>
          <circle cx="150" cy="50" r="40" fill="url(#hotspot1)"/>
          <circle cx="80" cy="80" r="25" fill="url(#hotspot2)"/>
          {/* Location marker */}
          <circle cx="150" cy="60" r="4" className="fill-foreground"/>
          <circle cx="150" cy="60" r="8" fill="none" className="stroke-foreground" strokeWidth="1" opacity="0.3"/>
        </svg>
        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 font-mono text-[10px] text-muted-foreground">
          2 active zones
        </div>
      </div>
    </IntelCard>
  )
}

// ============================================
// DETAIL MODAL (placeholder)
// ============================================
function DetailModal({ 
  isOpen, 
  onClose, 
  title 
}: { 
  isOpen: boolean
  onClose: () => void
  title: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          Full details and source information would appear here...
        </p>
      </div>
    </div>
  )
}

// ============================================
// MAIN BRIEFING VIEW
// ============================================
export function BriefingView({ 
  selectedLocationId,
  onNavigateToMap 
}: { 
  selectedLocationId: string
  onNavigateToMap: () => void 
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")

  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId) || CURRENT_LOCATION

  const openModal = (title: string) => {
    setModalTitle(title)
    setModalOpen(true)
  }

  return (
    <div className="flex-1 overflow-y-auto" data-lenis-prevent>
      <div className="p-6 md:p-8 lg:p-12">
        {/* Score and narrative */}
        <ScoreHero location={selectedLocation} />

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Primary - full width */}
          <div className="lg:col-span-2">
            <RavenAnalysisCard onOpenModal={() => openModal("Vehicle Break-ins Pattern")} />
          </div>

          {/* Two column layout */}
          <ActiveConditionsCard onOpenModal={() => openModal("Active Conditions")} />
          <CivicSignalsCard onOpenModal={() => openModal("Civic Signals")} />
          
          {/* What's quiet and temporal */}
          <WhatsQuietCard onOpenModal={() => openModal("What's Quiet")} />
          <TemporalPatternsCard onOpenModal={() => openModal("Temporal Patterns")} />

          {/* Map preview - full width */}
          <div className="lg:col-span-2">
            <MapPreviewCard onNavigateToMap={onNavigateToMap} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[10px] text-muted-foreground">
            Last updated 5 minutes ago
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            Sources: Crystal Lake PD • McHenry County • 311 Reports
          </span>
        </footer>
      </div>

      {/* Modal */}
      <DetailModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
      />
    </div>
  )
}