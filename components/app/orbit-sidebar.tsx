// components/app/orbit-sidebar.tsx
"use client"

import { useState } from "react"
import { 
  ORBIT_LOCATIONS, 
  type LocationData,
  getScoreColor,
  type ScoreColorType
} from "@/lib/raven-data"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Settings
} from "lucide-react"

// Color schemes for location cards - darker, more depth like Weather app
const cardSchemes: Record<ScoreColorType, { bg: string; overlay: string }> = {
  emerald: { 
    bg: "from-emerald-800 via-emerald-900 to-slate-900", 
    overlay: "bg-emerald-500/10"
  },
  sky: { 
    bg: "from-slate-700 via-slate-800 to-slate-900", 
    overlay: "bg-sky-500/10"
  },
  amber: { 
    bg: "from-amber-800 via-amber-900 to-slate-900", 
    overlay: "bg-amber-500/10"
  },
  rose: { 
    bg: "from-rose-800 via-rose-900 to-slate-900", 
    overlay: "bg-rose-500/10"
  }
}

function LocationCard({ 
  location, 
  isSelected, 
  onClick 
}: { 
  location: LocationData
  isSelected: boolean
  onClick: () => void
}) {
  const scoreColor = getScoreColor(location.stabilityScore)
  const scheme = cardSchemes[scoreColor]
  
  const TrendIcon = location.trend === "improving" 
    ? TrendingUp 
    : location.trend === "declining"
    ? TrendingDown
    : Minus
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-400"
    : location.trend === "declining"
    ? "text-rose-400"
    : "text-slate-400"

  // Get current time for the location
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl overflow-hidden transition-all duration-300
        ${isSelected 
          ? "ring-2 ring-white/30 shadow-xl scale-[1.02]" 
          : "hover:scale-[1.01] hover:shadow-lg"
        }
      `}
    >
      <div className={`relative bg-gradient-to-br ${scheme.bg} p-4 min-h-[120px]`}>
        {/* Subtle noise/texture overlay */}
        <div className={`absolute inset-0 ${scheme.overlay}`} />
        
        {/* Stars/dots pattern for depth */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-3 right-8 w-1 h-1 bg-white/60 rounded-full" />
          <div className="absolute top-6 right-4 w-0.5 h-0.5 bg-white/40 rounded-full" />
          <div className="absolute bottom-8 right-12 w-0.5 h-0.5 bg-white/50 rounded-full" />
          <div className="absolute top-10 right-16 w-0.5 h-0.5 bg-white/30 rounded-full" />
        </div>
        
        <div className="relative">
          {/* Top row: Name and Score */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white text-lg">{location.name}</h3>
              <p className="text-white/60 text-xs mt-0.5">
                {timeString}
                {location.label && (
                  <span className="ml-2 text-white/40">• {location.label}</span>
                )}
              </p>
            </div>
            <span className="text-4xl font-light text-white">
              {location.stabilityScore}
            </span>
          </div>
          
          {/* Bottom row: Status and Trend */}
          <div className="flex items-end justify-between mt-6">
            <p className="text-white/70 text-sm">{location.briefStatus}</p>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${trendColor} text-xs`}>
                <TrendIcon className="w-3 h-3" />
                <span>{location.trendPercent > 0 ? "+" : ""}{location.trendPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export function OrbitSidebar({ 
  selectedLocationId,
  onLocationSelect,
  collapsed,
  onToggle
}: { 
  selectedLocationId: string
  onLocationSelect: (id: string) => void
  collapsed: boolean
  onToggle: () => void
}) {
  const [logoHovered, setLogoHovered] = useState(false)

  return (
    <div 
      className={`
        bg-background border-r border-border/40 flex flex-col h-full transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-72"}
      `}
    >
      {/* Header with logo/toggle */}
      <div className="p-4 border-b border-border/40">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {/* Logo and brand */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              className="relative w-8 h-8 flex items-center justify-center transition-all duration-200"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {logoHovered ? (
                collapsed ? (
                  <PanelLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                )
              ) : (
                // Text logo fallback - drop your logo at /public/images/raven-logo.png
                <span className="font-mono text-sm uppercase tracking-wider text-accent font-semibold">
                  R
                </span>
              )}
            </button>
            {!collapsed && (
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground font-medium">
                Raven
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Location cards - only show when expanded */}
      {!collapsed && (
        <>
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-light"
            data-lenis-prevent
          >
            {ORBIT_LOCATIONS.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isSelected={location.id === selectedLocationId}
                onClick={() => onLocationSelect(location.id)}
              />
            ))}
            
            {/* Add Location */}
            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Location</span>
            </button>
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-border/40">
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
              <span className="text-xs">Manage Orbit</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}