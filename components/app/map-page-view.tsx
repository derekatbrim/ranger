// components/app/map-page-view.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Shield,
  Building2,
  Construction,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  X,
  MapPin
} from "lucide-react"
import type { Incident } from "@/lib/mock-data"

interface MapPageViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const typeConfig = {
  crime: {
    color: "#be123c",      // rose-700 (muted)
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "#0369a1",      // sky-700 (muted)
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-200",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "#475569",      // slate-600 (muted)
    bgColor: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    icon: Construction,
    label: "Infrastructure",
  },
}

const filterOptions = [
  { id: "crime", label: "Safety", icon: Shield },
  { id: "civic", label: "Civic", icon: Building2 },
  { id: "infrastructure", label: "Infrastructure", icon: Construction },
]

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
  const [activeFilters, setActiveFilters] = useState<string[]>(["crime", "civic", "infrastructure"])

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  const filteredIncidents = incidents.filter(i => activeFilters.includes(i.type))

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
              width: ${isSelected ? "32px" : "24px"};
              height: ${isSelected ? "32px" : "24px"};
              background: ${config.color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              ${isSelected ? "transform: scale(1.1);" : ""}
            ">
            </div>
          `,
          iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
          iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
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
    <div className="flex-1 flex h-full">
      {/* Map Area - static */}
      <div className="flex-1 relative">
        {/* Search and Filters */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Crystal Lake, IL"
              defaultValue="Crystal Lake, IL"
              className="w-full bg-white shadow-md rounded-xl py-2.5 pl-10 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Filter chips - multi-select */}
          {filterOptions.map((filter) => {
            const isActive = activeFilters.includes(filter.id)
            const Icon = filter.icon
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium shadow-md border transition-all",
                  isActive
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                {isActive && (
                  <X className="w-3.5 h-3.5 ml-1" />
                )}
              </button>
            )
          })}
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

      {/* Cards Sidebar - only this scrolls */}
      <div className="w-[400px] border-l border-gray-200 bg-white flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold text-gray-900">
            Crystal Lake, IL
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredIncidents.length} incidents nearby
          </p>
        </div>

        {/* Scrollable cards */}
        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-light">
          <div className="p-4 space-y-3">
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
        "w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm",
        isSelected 
          ? "border-gray-300 shadow-sm bg-gray-50" 
          : "border-gray-200 hover:border-gray-300 bg-white"
      )}
    >
      {/* Badge row */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
          config.bgColor,
          config.textColor
        )}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </div>
        {incident.urgency >= 7 && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
            Priority
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 leading-snug">
        {incident.title}
      </h3>

      {/* Summary - truncated */}
      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
        {incident.summary}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        <span>{incident.location}</span>
        <span>•</span>
        <Clock className="w-3 h-3" />
        <span>{formatTimeAgo(incident.timestamp)}</span>
        {incident.verified && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </>
        )}
      </div>
    </button>
  )
}