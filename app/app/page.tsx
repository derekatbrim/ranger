// app/app/page.tsx
"use client"

import { useState } from "react"
import { LeftNav } from "@/components/app/left-nav"
import { FeedView } from "@/components/app/feed-view"
import { MapPageView } from "@/components/app/map-page-view"
import { RightRail } from "@/components/app/right-rail"
import { MOCK_INCIDENTS, type Incident, type ViewType } from "@/lib/mock-data"

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("pulse")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="mx-auto max-w-[1400px] flex h-full min-h-0">
        {/* Left Navigation */}
        <LeftNav 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        {/* Main Content Area */}
        <main className="flex-1 flex min-h-0 overflow-hidden">
          {currentView === "pulse" && (
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <FeedView 
                incidents={MOCK_INCIDENTS}
                onIncidentSelect={setSelectedIncident}
                selectedIncident={selectedIncident}
              />
              <RightRail />
            </div>
          )}

          {currentView === "map" && (
            <MapPageView 
              incidents={MOCK_INCIDENTS}
              onIncidentSelect={setSelectedIncident}
              selectedIncident={selectedIncident}
            />
          )}

          {currentView === "forecast" && (
            <div className="flex-1 border-x border-gray-200 bg-white p-8">
              <h1 className="text-xl font-bold">Forecast</h1>
              <p className="text-gray-500 mt-2">Trajectory modeling coming soon</p>
            </div>
          )}

          {currentView === "alerts" && (
            <div className="flex-1 border-x border-gray-200 bg-white p-8">
              <h1 className="text-xl font-bold">Alerts</h1>
              <p className="text-gray-500 mt-2">Coming soon</p>
            </div>
          )}

          {currentView === "watchlist" && (
            <div className="flex-1 border-x border-gray-200 bg-white p-8">
              <h1 className="text-xl font-bold">Watchlist</h1>
              <p className="text-gray-500 mt-2">Coming soon</p>
            </div>
          )}

          {currentView === "profile" && (
            <div className="flex-1 border-x border-gray-200 bg-white p-8">
              <h1 className="text-xl font-bold">Profile</h1>
              <p className="text-gray-500 mt-2">Coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}