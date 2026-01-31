// app/app/page.tsx
"use client"

import { useState } from "react"
import { BriefingView } from "@/components/app/briefing-view"
import { MapPageView } from "@/components/app/map-page-view"
import { MOCK_INCIDENTS, type Incident } from "@/lib/mock-data"

type ViewType = "brief" | "map"

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("brief")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  if (currentView === "map") {
    return (
      <div className="h-screen flex flex-col">
        {/* Minimal header for map view */}
        <div className="border-b border-border/40 bg-background">
          <div className="flex items-center justify-between px-6 md:px-12 lg:px-28 py-4">
            <button 
              onClick={() => setCurrentView("brief")}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent hover:text-accent/80 transition-colors"
            >
              ← Back to Brief
            </button>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Activity Map
            </span>
          </div>
        </div>
        <div className="flex-1">
          <MapPageView 
            incidents={MOCK_INCIDENTS}
            onIncidentSelect={setSelectedIncident}
            selectedIncident={selectedIncident}
          />
        </div>
      </div>
    )
  }

  return <BriefingView onNavigateToMap={() => setCurrentView("map")} />
}