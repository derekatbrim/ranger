// components/app/map-page-view.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Search, 
  ChevronDown,
  Shield,
  Building2,
  Construction,
  Clock,
  CheckCircle2,
  SlidersHorizontal
} from "lucide-react"
import type { Incident } from "@/app/app/page"

interface MapPageViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const typeConfig = {
  crime: {
    color: "#ef4444",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "#3b82f6",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "#6b7280",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-200",
    icon: Construction,
    label: "Infrastructure",
  },
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHrs < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins}m ago`
  }
  if (diffHrs < 24) {
    return `${diffHrs}h ago`
  }
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

export function MapPageView({ incidents, onIncidentSelect, selectedIncident }: MapPageViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filters = [
    { id: "all", label: "All" },
    { id: "crime", label: "Safety" },
    { id: "civic", label: "Civic" },
    { id: "infrastructure", label: "Infrastructure" },
  ]

  const filteredIncidents = activeFilter === "all" 
    ? incidents 
    : incidents.filter(i => i.type === activeFilter)

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadMap = async () => {
      // @ts-ignore
      const L = await import("leaflet")
      
      // Load CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
        // Wait for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!mapRef.current || mapInstanceRef.current) return

      // Initialize map
      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([42.2411, -88.3162], 12)

      // Light style map tiles (similar to Zillow)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Add markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    const loadMarkers = async () => {
      // @ts-ignore
      const L = await import("leaflet")
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add new markers
      filteredIncidents.forEach((incident) => {
        const config = typeConfig[incident.type]
        const isSelected = selectedIncident?.id === incident.id

        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${isSelected ? "36px" : "28px"};
              height: ${isSelected ? "36px" : "28px"};
              background: ${config.color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              ${isSelected ? "transform: scale(1.1);" : ""}
            ">
              <span style="color: white; font-size: 10px; font-weight: bold;">
                ${incident.urgency >= 7 ? "!" : ""}
              </span>
            </div>
          `,
          iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
          iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        })

        const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], { icon })
          .addTo(map)
          .on("click", () => onIncidentSelect(incident))

        markersRef.current.push(marker)
      })
    }

    loadMarkers()
  }, [mapLoaded, filteredIncidents, selectedIncident, onIncidentSelect])

  // Pan to selected incident
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedIncident) return
    
    mapInstanceRef.current.panTo([
      selectedIncident.coordinates.lat,
      selectedIncident.coordinates.lng
    ], { animate: true })
  }, [mapLoaded, selectedIncident])

  return (
    <div className="flex-1 flex min-h-screen">
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Search and Filters */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Crystal Lake, IL"
              defaultValue="Crystal Lake, IL"
              className="w-full bg-white shadow-lg rounded-lg py-2.5 pl-10 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filter buttons */}
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border transition-all",
                activeFilter === filter.id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
            >
              {filter.label}
              {filter.id !== "all" && (
                <ChevronDown className="w-4 h-4 ml-1 inline" />
              )}
            </button>
          ))}

          {/* More filters */}
          <button className="px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            More
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} className="absolute inset-0" />

        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        )}
      </div>

      {/* Cards Sidebar */}
      <div className="w-[420px] border-l border-gray-200 bg-white overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Crystal Lake, IL Incidents
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredIncidents.length} results
          </p>
        </div>

        {/* Scrollable cards */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid gap-3">
            {filteredIncidents.map((incident) => (
              <IncidentCard 
                key={incident.id}
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onSelect={() => onIncidentSelect(incident)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IncidentCard({
  incident,
  isSelected,
  onSelect,
}: {
  incident: Incident
  isSelected: boolean
  onSelect: () => void
}) {
  const config = typeConfig[incident.type]
  const Icon = config.icon

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md",
        isSelected 
          ? "border-orange-500 shadow-md bg-orange-50" 
          : "border-gray-200 hover:border-gray-300 bg-white"
      )}
    >
      {/* Badge row */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          config.bgColor,
          config.textColor
        )}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </div>
        {incident.urgency >= 7 && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            High Priority
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 leading-snug">
        {incident.title}
      </h3>

      {/* Summary - truncated */}
      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
        {incident.summary}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
        <span>{incident.location}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(incident.timestamp)}
        </span>
        {incident.verified && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1 text-orange-600">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </>
        )}
      </div>

      {/* Source */}
      <div className="mt-2 text-xs text-gray-400">
        Source: {incident.source}
      </div>
    </button>
  )
}
