// app/app/page.tsx
"use client"

import { useState } from "react"
import { BriefingView } from "@/components/app/briefing-view"
import { OrbitSidebar } from "@/components/app/orbit-sidebar"
import { MapPageView } from "@/components/app/map-page-view"
import { MOCK_INCIDENTS, type Incident } from "@/lib/mock-data"
import { ORBIT_LOCATIONS } from "@/lib/raven-data"
import { Menu, X } from "lucide-react"
import Image from "next/image"

type ViewType = "brief" | "map"

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("brief")
  const [selectedLocationId, setSelectedLocationId] = useState("crystal-lake")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId)

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header - only on mobile */}
      <header className="md:hidden flex-shrink-0 border-b border-border/40 px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Image 
            src="/images/raven-logo.png" 
            alt="Raven" 
            width={24} 
            height={24}
            className="object-contain"
          />
          <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wide text-foreground">
            RAVEN
          </span>
        </div>
        
        {/* Mobile view toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setCurrentView("brief")}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                currentView === "brief" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              Brief
            </button>
            <button
              onClick={() => setCurrentView("map")}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                currentView === "map" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              Map
            </button>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Location Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 top-[57px]">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-[280px] h-full bg-background border-l border-border overflow-y-auto">
            <div className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                Your Orbit
              </p>
              <div className="space-y-2">
                {ORBIT_LOCATIONS.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => {
                      setSelectedLocationId(location.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      location.id === selectedLocationId
                        ? "bg-accent/10 border border-accent/30"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{location.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{location.label}</p>
                      </div>
                      <span className="text-2xl font-light text-foreground">{location.stabilityScore}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <OrbitSidebar 
          selectedLocationId={selectedLocationId}
          onLocationSelect={setSelectedLocationId}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header - hidden on mobile */}
        <header className="hidden md:flex flex-shrink-0 border-b border-border/40 px-6 py-3 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("brief")}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                  currentView === "brief" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Brief
              </button>
              <button
                onClick={() => setCurrentView("map")}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                  currentView === "map" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Map
              </button>
            </div>
          </div>
          
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </header>

        {/* Content */}
        {currentView === "brief" ? (
          <BriefingView 
            selectedLocationId={selectedLocationId}
            onNavigateToMap={() => setCurrentView("map")} 
          />
        ) : (
          <MapPageView 
            incidents={MOCK_INCIDENTS}
            onIncidentSelect={setSelectedIncident}
            selectedIncident={selectedIncident}
          />
        )}
      </div>
    </div>
  )
}