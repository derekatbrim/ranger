// components/app/feed-view.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Building2, 
  Construction, 
  MapPin,
  CheckCircle2,
  Share,
  Bookmark,
  Heart,
  MoreHorizontal,
  Activity,
  ChevronDown,
  Home,
  Briefcase,
  Clock
} from "lucide-react"
import type { Incident } from "@/lib/mock-data"

interface FeedViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const orbitLocations = [
  { id: "home", name: "Home", icon: Home },
  { id: "work", name: "Work", icon: Briefcase },
  { id: "all", name: "All Locations", icon: MapPin },
]

const tabs = [
  { id: "for-you", label: "For You" },
  { id: "safety", label: "Safety" },
  { id: "civic", label: "Civic" },
  { id: "infrastructure", label: "Infrastructure" },
]

const typeConfig = {
  crime: {
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-100",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
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
    return `${diffMins}m`
  }
  if (diffHrs < 24) {
    return `${diffHrs}h`
  }
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d`
}

export function FeedView({ incidents, onIncidentSelect, selectedIncident }: FeedViewProps) {
  const [activeTab, setActiveTab] = useState("for-you")
  const [activeLocation, setActiveLocation] = useState("home")
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)

  const currentLocation = orbitLocations.find(l => l.id === activeLocation) || orbitLocations[0]
  const LocationIcon = currentLocation.icon

  const filteredIncidents = activeTab === "for-you" 
    ? incidents 
    : incidents.filter(i => {
        if (activeTab === "safety") return i.type === "crime"
        if (activeTab === "civic") return i.type === "civic"
        if (activeTab === "infrastructure") return i.type === "infrastructure"
        return true
      })

  return (
    <div className="w-[600px] border-x border-gray-200 flex flex-col" style={{ height: '100%', maxHeight: '100vh' }}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        {/* Title bar with orbit picker */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-gray-700" />
            <span className="text-xl font-semibold text-gray-900">Pulse</span>
          </div>
          
          {/* Orbit Location Picker */}
          <div className="relative">
            <button 
              onClick={() => setLocationPickerOpen(!locationPickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <LocationIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{currentLocation.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            
            {locationPickerOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setLocationPickerOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                  {orbitLocations.map((location) => {
                    const Icon = location.icon
                    return (
                      <button
                        key={location.id}
                        onClick={() => {
                          setActiveLocation(location.id)
                          setLocationPickerOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                          activeLocation === location.id && "bg-gray-50"
                        )}
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{location.name}</span>
                        {activeLocation === location.id && (
                          <CheckCircle2 className="w-4 h-4 text-gray-900 ml-auto" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3.5 text-sm font-semibold transition-colors relative hover:bg-gray-50",
                activeTab === tab.id ? "text-gray-900" : "text-gray-500"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto" style={{ overflowY: 'auto' }}>
        {/* The Pulse - AI Summary */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Today's Brief</span>
                <span className="text-xs text-gray-400">• 8:00 AM</span>
              </div>
              <p className="text-gray-600 mt-1 text-[15px] leading-relaxed">
                Crystal Lake is calm this morning. 2 minor incidents overnight, down from last week's average. 
                Route 14 eastbound remains closed for utility work through Friday.
              </p>
            </div>
          </div>
        </div>

        {/* Feed items as cards */}
        <div className="p-4 space-y-4 pb-8">
          {filteredIncidents.map((incident) => (
            <IncidentCard 
              key={incident.id} 
              incident={incident}
              onSelect={() => onIncidentSelect(incident)}
              isSelected={selectedIncident?.id === incident.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function IncidentCard({ 
  incident, 
  onSelect, 
  isSelected 
}: { 
  incident: Incident
  onSelect: () => void
  isSelected: boolean
}) {
  const config = typeConfig[incident.type]
  const Icon = config.icon
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(incident.engagement.comments)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (liked) {
      setLikeCount(prev => prev - 1)
    } else {
      setLikeCount(prev => prev + 1)
    }
    setLiked(!liked)
  }

  return (
    <article 
      onClick={onSelect}
      className={cn(
        "bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm",
        isSelected 
          ? "border-gray-300 shadow-sm" 
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
            config.bgColor,
            config.color
          )}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </div>

          {/* Verified badge */}
          {incident.verified && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </div>
          )}

          {/* High priority - muted */}
          {incident.urgency >= 7 && (
            <div className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
              Priority
            </div>
          )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation() }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-[16px] leading-snug">
        {incident.title}
      </h3>

      {/* Summary */}
      <p className="text-gray-600 mt-2 text-[15px] leading-relaxed">
        {incident.summary}
      </p>

      {/* Location + Time row */}
      <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {incident.location}
        </span>
        <span>•</span>
        <span>{incident.municipality}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatTimeAgo(incident.timestamp)}
        </span>
      </div>

      {/* Source */}
      <div className="mt-2 text-xs text-gray-400">
        Source: {incident.source}
      </div>

      {/* Engagement row */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        {/* Like button with overlapping avatars */}
        <button 
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            liked 
              ? "bg-rose-50 text-rose-600" 
              : "text-gray-500 hover:bg-gray-50 hover:text-rose-600"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          
          {/* Overlapping profile pics */}
          {likeCount > 0 && (
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 border-2 border-white" />
              {likeCount > 1 && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-300 to-sky-400 border-2 border-white" />
              )}
              {likeCount > 2 && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 border-2 border-white" />
              )}
            </div>
          )}
          
          <span>{likeCount}</span>
        </button>

        {/* Share button */}
        <button 
          onClick={(e) => { e.stopPropagation() }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
        >
          <Share className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Save button */}
        <button 
          onClick={(e) => { 
            e.stopPropagation()
            setSaved(!saved)
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ml-auto",
            saved 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          )}
        >
          <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
          <span>Save</span>
        </button>
      </div>
    </article>
  )
}