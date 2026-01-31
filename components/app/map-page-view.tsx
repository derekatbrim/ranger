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
  X,
  MapPin,
  Layers,
  ChevronRight,
  ChevronUp
} from "lucide-react"
import type { Incident } from "@/lib/mock-data"

interface MapPageViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const typeConfig = {
  crime: {
    color: "#be123c",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600",
    borderColor: "border-rose-500/20",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "#0369a1",
    bgColor: "bg-sky-500/10",
    textColor: "text-sky-600",
    borderColor: "border-sky-500/20",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "#d97706",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    borderColor: "border-amber-500/20",
    icon: Construction,
    label: "Infrastructure",
  },
}

const filterOptions = [
  { id: "crime", label: "Safety", icon: Shield, color: "rose" },
  { id: "civic", label: "Civic", icon: Building2, color: "sky" },
  { id: "infrastructure", label: "Infrastructure", icon: Construction, color: "amber" },
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
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

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
      
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([42.2411, -88.3162], 13)

      // Light, minimal style tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map)

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

      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      filteredIncidents.forEach((incident) => {
        const config = typeConfig[incident.type]
        const isSelected = selectedIncident?.id === incident.id

        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${isSelected ? "28px" : "20px"};
              height: ${isSelected ? "28px" : "20px"};
              background: ${config.color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              transition: all 0.2s ease;
              ${isSelected ? "transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.25);" : ""}
            ">
            </div>
          `,
          iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
          iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
        })

        const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], { icon })
          .addTo(map)
          .on("click", () => {
            onIncidentSelect(incident)
            setMobileSheetOpen(true)
          })

        markersRef.current.push(marker)
      })
    }

    loadMarkers()
  }, [mapLoaded, filteredIncidents, selectedIncident, onIncidentSelect])

  // Pan to selected
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedIncident) return
    
    mapInstanceRef.current.panTo([
      selectedIncident.coordinates.lat,
      selectedIncident.coordinates.lng
    ], { animate: true })
  }, [mapLoaded, selectedIncident])

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full relative">
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="relative flex-shrink-0 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search location..."
              defaultValue="Crystal Lake, IL"
              className="w-full md:w-64 bg-background/95 backdrop-blur-sm border border-border shadow-sm py-2.5 pl-10 pr-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Filter chips - horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 -mb-2 md:mb-0">
            {filterOptions.map((filter) => {
              const isActive = activeFilters.includes(filter.id)
              const Icon = filter.icon
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider border transition-all whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background/95 backdrop-blur-sm text-muted-foreground border-border hover:border-foreground/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{filter.label}</span>
                  {isActive && <X className="w-3 h-3 ml-1" />}
                </button>
              )
            })}
          </div>

          {/* Layer toggle - hidden on mobile */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "hidden md:flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider border transition-all ml-auto",
              showHeatmap
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-background/95 backdrop-blur-sm text-muted-foreground border-border hover:border-accent/50"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Heatmap
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} className="absolute inset-0" />

        {/* Loading */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <span className="font-mono text-sm text-muted-foreground">Loading map...</span>
          </div>
        )}

        {/* Legend - hidden on mobile */}
        <div className="hidden md:block absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm border border-border p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Legend</p>
          <div className="space-y-1.5">
            {filterOptions.map(filter => {
              const config = typeConfig[filter.id as keyof typeof typeConfig]
              return (
                <div key={filter.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="font-mono text-xs text-foreground/70">{filter.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile: Floating button to open incident list */}
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="md:hidden absolute bottom-4 left-4 right-4 z-[1000] bg-background border border-border shadow-lg p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Activity Feed</p>
            <p className="font-mono text-sm text-foreground">{filteredIncidents.length} incidents</p>
          </div>
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Desktop: Incident Panel */}
      <div className="hidden md:flex w-[380px] border-l border-border bg-background flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Activity Feed</span>
          </div>
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-tight text-foreground">
            Crystal Lake
          </h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {filteredIncidents.length} incidents in view
          </p>
        </div>

        {/* Incident cards */}
        <div 
          className="flex-1 overflow-y-auto scrollbar-light"
          data-lenis-prevent
        >
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

      {/* Mobile: Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-[1001]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSheetOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex-shrink-0 px-4 pb-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Activity Feed</p>
                <p className="font-mono text-sm text-foreground">{filteredIncidents.length} incidents</p>
              </div>
              <button 
                onClick={() => setMobileSheetOpen(false)}
                className="p-2 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
      )}
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
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full text-left border p-4 transition-all relative overflow-hidden",
        isSelected 
          ? "border-accent/50 bg-accent/5" 
          : "border-border hover:border-accent/30"
      )}
    >
      {/* Hover background */}
      <div 
        className={cn(
          "absolute inset-0 bg-accent/5 transition-opacity",
          isHovered && !isSelected ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Corner accent on hover/select */}
      <div className={cn(
        "absolute top-0 right-0 w-8 h-8 transition-opacity",
        isHovered || isSelected ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute top-0 right-0 w-full h-[2px] bg-accent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-accent" />
      </div>

      <div className="relative">
        {/* Badge row */}
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
            config.bgColor,
            config.textColor
          )}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
          {incident.urgency >= 7 && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-rose-600 bg-rose-500/10 px-2 py-1">
              Priority
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-snug">
          {incident.title}
        </h3>

        {/* Summary */}
        <p className="font-mono text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {incident.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3 font-mono text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{incident.location}</span>
          <span className="text-border">•</span>
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(incident.timestamp)}</span>
          {incident.verified && (
            <>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chevron on hover */}
      <ChevronRight className={cn(
        "absolute bottom-4 right-4 w-4 h-4 transition-all",
        isHovered || isSelected ? "text-accent translate-x-0 opacity-100" : "text-transparent -translate-x-2 opacity-0"
      )} />
    </button>
  )
}