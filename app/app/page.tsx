// app/app/page.tsx
"use client"

import { useState } from "react"
import { BriefingView } from "@/components/app/briefing-view"
import { OrbitSidebar } from "@/components/app/orbit-sidebar"
import { MapPageView } from "@/components/app/map-page-view"
import { MOCK_INCIDENTS, type Incident } from "@/lib/mock-data"
import { ORBIT_LOCATIONS, getScoreColor } from "@/lib/raven-data"
import { Menu, X, ChevronDown, Bell, User, MapPin, Compass, Clock, Settings, HelpCircle, Plus } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type ViewType = "brief" | "map"

// Navigation items for mobile menu
const navItems = [
  { id: "brief", label: "Daily Brief", icon: Compass },
  { id: "map", label: "Activity Map", icon: MapPin },
  { id: "alerts", label: "Alerts", icon: Bell, comingSoon: true },
  { id: "history", label: "History", icon: Clock, comingSoon: true },
]

const secondaryNavItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help & Feedback", icon: HelpCircle },
]

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("brief")
  const [selectedLocationId, setSelectedLocationId] = useState("crystal-lake")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [orbitDropdownOpen, setOrbitDropdownOpen] = useState(true)

  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId)

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "fixed inset-0 z-[100] lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-background" />

        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            "absolute top-4 right-4 z-[110] w-12 h-12 flex items-center justify-center border border-border bg-card transition-all duration-300",
            mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
          style={{ marginTop: 'env(safe-area-inset-top)' }}
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Menu content */}
        <div 
          className="relative z-[105] h-full flex flex-col overflow-y-auto"
          style={{ 
            paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
            paddingLeft: 'calc(env(safe-area-inset-left) + 1.5rem)',
            paddingRight: 'calc(env(safe-area-inset-right) + 1.5rem)'
          }}
        >
          {/* Brand */}
          <div 
            className={cn(
              "flex items-center gap-3 mb-8 transition-all duration-300",
              mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}
            style={{ transitionDelay: mobileMenuOpen ? "50ms" : "0ms" }}
          >
            <Image 
              src="/images/raven-logo.png" 
              alt="Raven" 
              width={32} 
              height={32}
              className="object-contain"
            />
            <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-foreground">
              RAVEN
            </span>
          </div>

          {/* Orbit Location Selector */}
          <div 
            className={cn(
              "mb-6 transition-all duration-300",
              mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}
            style={{ transitionDelay: mobileMenuOpen ? "100ms" : "0ms" }}
          >
            <button
              onClick={() => setOrbitDropdownOpen(!orbitDropdownOpen)}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                Your Orbit
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform", 
                orbitDropdownOpen && "rotate-180"
              )} />
            </button>
            
            {/* Orbit Cards - Condensed weather style */}
            {orbitDropdownOpen && (
              <div className="space-y-2">
                {ORBIT_LOCATIONS.map((location, index) => {
                  const locScoreColor = getScoreColor(location.stabilityScore)
                  const cardSchemes: Record<string, string> = {
                    emerald: "from-emerald-800 via-emerald-900 to-slate-900",
                    sky: "from-slate-700 via-slate-800 to-slate-900",
                    amber: "from-amber-800 via-amber-900 to-slate-900",
                    rose: "from-rose-800 via-rose-900 to-slate-900"
                  }
                  const isSelected = location.id === selectedLocationId
                  
                  return (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedLocationId(location.id)
                        setOrbitDropdownOpen(false)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "w-full text-left rounded-xl overflow-hidden transition-all",
                        isSelected && "ring-2 ring-white/30"
                      )}
                    >
                      <div className={`relative bg-gradient-to-br ${cardSchemes[locScoreColor]} p-3`}>
                        {/* Stars pattern */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute top-2 right-6 w-0.5 h-0.5 bg-white/60 rounded-full" />
                          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white/40 rounded-full" />
                          <div className="absolute bottom-3 right-10 w-0.5 h-0.5 bg-white/50 rounded-full" />
                        </div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white text-sm truncate">{location.name}</h3>
                              {location.label && (
                                <span className="text-white/40 text-xs">• {location.label}</span>
                              )}
                            </div>
                            <p className="text-white/60 text-xs mt-0.5 truncate">{location.briefStatus}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <span className="text-2xl font-light text-white">{location.stabilityScore}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
                
                {/* Add Location */}
                <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-muted-foreground">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Location</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1 mb-8">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = (item.id === "brief" && currentView === "brief") || (item.id === "map" && currentView === "map")
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.comingSoon) {
                      if (item.id === "brief" || item.id === "map") {
                        setCurrentView(item.id as ViewType)
                      }
                      setMobileMenuOpen(false)
                    }
                  }}
                  disabled={item.comingSoon}
                  className={cn(
                    "group flex items-center gap-4 w-full text-left py-4 transition-all duration-300",
                    mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0",
                    item.comingSoon ? "opacity-50" : "cursor-pointer"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${150 + index * 50}ms` : "0ms" }}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-accent" : "text-muted-foreground"
                  )} />
                  <span
                    className={cn(
                      "font-[family-name:var(--font-bebas)] text-3xl tracking-tight transition-colors",
                      isActive ? "text-accent" : "text-foreground"
                    )}
                  >
                    {item.label.toUpperCase()}
                  </span>
                  {item.comingSoon && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="mt-auto pt-6 border-t border-border">
            {secondaryNavItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 w-full py-3 text-muted-foreground hover:text-foreground transition-all duration-300",
                    mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${350 + index * 50}ms` : "0ms" }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-mono text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:flex h-full">
        <OrbitSidebar 
          selectedLocationId={selectedLocationId}
          onLocationSelect={setSelectedLocationId}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <header 
          className="flex-shrink-0 border-b border-border/40 px-4 lg:px-6 flex items-center justify-between gap-4 bg-background"
          style={{ 
            paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
            paddingBottom: '0.75rem'
          }}
        >
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2">
            <Image 
              src="/images/raven-logo.png" 
              alt="Raven" 
              width={20} 
              height={20}
              className="object-contain"
            />
            <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wide text-foreground">
              RAVEN
            </span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setCurrentView("brief")}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200",
                currentView === "brief" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Brief
            </button>
            <button
              onClick={() => setCurrentView("map")}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200",
                currentView === "map" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Map
            </button>
          </div>
          
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </header>

        {/* Content with view transitions */}
        <div className="flex-1 min-h-0 relative">
          <div 
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentView === "brief" 
                ? "opacity-100 translate-x-0 z-10" 
                : "opacity-0 -translate-x-4 pointer-events-none z-0"
            )}
          >
            <BriefingView 
              selectedLocationId={selectedLocationId}
              onNavigateToMap={() => setCurrentView("map")} 
            />
          </div>
          <div 
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentView === "map" 
                ? "opacity-100 translate-x-0 z-10" 
                : "opacity-0 translate-x-4 pointer-events-none z-0"
            )}
          >
            <MapPageView 
              incidents={MOCK_INCIDENTS}
              onIncidentSelect={setSelectedIncident}
              selectedIncident={selectedIncident}
            />
          </div>
        </div>
      </div>
    </div>
  )
}