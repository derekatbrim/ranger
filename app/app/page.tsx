// app/app/page.tsx
"use client"

import { useState } from "react"
import { LeftNav } from "@/components/app/left-nav"
import { FeedView } from "@/components/app/feed-view"
import { MapPageView } from "@/components/app/map-page-view"
import { RightRail } from "@/components/app/right-rail"

export type ViewType = "feed" | "map" | "alerts" | "watchlist" | "profile"

// Mock data
export const MOCK_INCIDENTS = [
  {
    id: "1",
    type: "crime" as const,
    title: "Vehicle Break-ins Reported on Main Street",
    summary: "3 vehicles broken into overnight in the Main St parking lot between 11pm-3am. Police are investigating and have increased overnight patrols in the area.",
    location: "Main St & Oak Ave",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    urgency: 8,
    coordinates: { lat: 42.2411, lng: -88.3162 },
    source: "Crystal Lake PD",
    verified: true,
    engagement: { comments: 12, shares: 4 },
  },
  {
    id: "2", 
    type: "civic" as const,
    title: "Rezoning Hearing Scheduled for Virginia Street",
    summary: "Public hearing on proposed B-2 commercial rezoning for 450 Virginia St. Property owners within 500ft may see tax reassessment. Comment period open until Feb 15.",
    location: "450 Virginia St",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    urgency: 4,
    coordinates: { lat: 42.2431, lng: -88.3201 },
    source: "Planning Commission",
    verified: true,
    engagement: { comments: 8, shares: 2 },
  },
  {
    id: "3",
    type: "infrastructure" as const,
    title: "Route 14 Eastbound Lanes Closed for Utility Work",
    summary: "Eastbound lanes closed between Pingree Rd and Main St for emergency water main repair. Expect significant delays through Friday. Use Route 176 as alternate.",
    location: "Route 14 at Pingree Rd",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    urgency: 5,
    coordinates: { lat: 42.2251, lng: -88.3102 },
    source: "IDOT",
    verified: true,
    engagement: { comments: 23, shares: 15 },
  },
  {
    id: "4",
    type: "crime" as const,
    title: "Package Theft Pattern Identified on Dole Ave",
    summary: "Multiple package thefts reported this week, primarily targeting deliveries between 2-5pm. Residents advised to use delivery lockers or require signatures.",
    location: "Dole Ave",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    urgency: 6,
    coordinates: { lat: 42.2381, lng: -88.3142 },
    source: "Neighbor Verified",
    verified: false,
    engagement: { comments: 31, shares: 8 },
  },
  {
    id: "5",
    type: "civic" as const,
    title: "New Restaurant Liquor License Application Filed",
    summary: "Application filed for full liquor license at former hardware store location. Proposed hours until 12am weekdays, 2am weekends. City Council vote scheduled Feb 20.",
    location: "123 Williams St",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    urgency: 2,
    coordinates: { lat: 42.2421, lng: -88.3122 },
    source: "City Clerk",
    verified: true,
    engagement: { comments: 45, shares: 12 },
  },
  {
    id: "6",
    type: "crime" as const,
    title: "DUI Checkpoint Planned for Saturday Night",
    summary: "Crystal Lake PD announces sobriety checkpoint on Route 14 near downtown from 10pm-2am Saturday. Part of statewide holiday enforcement campaign.",
    location: "Route 14 Downtown",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    urgency: 3,
    coordinates: { lat: 42.2401, lng: -88.3182 },
    source: "Crystal Lake PD",
    verified: true,
    engagement: { comments: 67, shares: 89 },
  },
]

export type Incident = typeof MOCK_INCIDENTS[0]

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("feed")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] flex">
        {/* Left Navigation */}
        <LeftNav 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        {/* Main Content Area */}
        <main className="flex-1 flex min-h-screen">
          {currentView === "feed" && (
            <>
              <FeedView 
                incidents={MOCK_INCIDENTS}
                onIncidentSelect={setSelectedIncident}
                selectedIncident={selectedIncident}
              />
              <RightRail />
            </>
          )}

          {currentView === "map" && (
            <MapPageView 
              incidents={MOCK_INCIDENTS}
              onIncidentSelect={setSelectedIncident}
              selectedIncident={selectedIncident}
            />
          )}

          {currentView === "alerts" && (
            <div className="flex-1 border-x border-gray-200 p-8">
              <h1 className="text-xl font-bold">Alerts</h1>
              <p className="text-gray-500 mt-2">Coming soon</p>
            </div>
          )}

          {currentView === "watchlist" && (
            <div className="flex-1 border-x border-gray-200 p-8">
              <h1 className="text-xl font-bold">Watchlist</h1>
              <p className="text-gray-500 mt-2">Coming soon</p>
            </div>
          )}

          {currentView === "profile" && (
            <div className="flex-1 border-x border-gray-200 p-8">
              <h1 className="text-xl font-bold">Profile</h1>
              <p className="text-gray-500 mt-2">Coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}