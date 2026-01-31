// components/app/orbit-sidebar.tsx
"use client"

import { useState } from "react"
import { 
  ORBIT_LOCATIONS, 
  type LocationData,
  getScoreColor 
} from "@/lib/raven-data"
import { 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  MapPin,
  Home,
  Briefcase,
  Heart,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react"

const labelIcons = {
  Home: Home,
  Work: Briefcase,
  "Mom's Place": Heart,
  default: MapPin
}

function LocationCard({ 
  location, 
  isSelected, 
  onClick,
  collapsed
}: { 
  location: LocationData
  isSelected: boolean
  onClick: () => void
  collapsed: boolean
}) {
  const Icon = labelIcons[location.label as keyof typeof labelIcons] || labelIcons.default
  const scoreColor = getScoreColor(location.stabilityScore)
  
  const trendIcon = location.trend === "improving" 
    ? <TrendingUp className="w-3 h-3" />
    : location.trend === "declining"
    ? <TrendingDown className="w-3 h-3" />
    : <Minus className="w-3 h-3" />
    
  const trendColorClass = location.trend === "improving" 
    ? "text-emerald-600"
    : location.trend === "declining"
    ? "text-rose-600"
    : "text-slate-400"

  const scoreBgColor = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  }

  // Collapsed view - just show score badge
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={`
          w-full flex items-center justify-center p-2 rounded-xl transition-all duration-200
          ${isSelected 
            ? "bg-slate-100 ring-2 ring-slate-900" 
            : "hover:bg-slate-50"
          }
        `}
        title={`${location.name} - ${location.stabilityScore}`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${scoreBgColor[scoreColor]}`}>
          {location.stabilityScore}
        </div>
      </button>
    )
  }

  // Expanded view
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl p-4 transition-all duration-200
        ${isSelected 
          ? "bg-slate-100 ring-2 ring-slate-900" 
          : "hover:bg-slate-50 border border-slate-200"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{location.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
            <Icon className="w-3 h-3" />
            <span>{location.label}</span>
          </div>
        </div>
        <div className={`text-2xl font-semibold ${scoreBgColor[scoreColor].split(" ")[1]}`}>
          {location.stabilityScore}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-slate-500 truncate">{location.briefStatus}</p>
        <div className={`flex items-center gap-1 ${trendColorClass}`}>
          {trendIcon}
          <span className="text-xs font-medium">
            {location.trend === "stable" 
              ? "Stable" 
              : `${location.trendPercent > 0 ? "+" : ""}${location.trendPercent}%`
            }
          </span>
        </div>
      </div>
    </button>
  )
}

export function OrbitSidebar({ 
  selectedLocationId,
  onLocationSelect 
}: { 
  selectedLocationId: string
  onLocationSelect: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  
  const filteredLocations = ORBIT_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.label?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div 
      className={`
        bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-80"}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-semibold text-slate-900">Orbit</h2>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Search (only when expanded) */}
      {!collapsed && (
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search locations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
      )}
      
      {/* Location List */}
      <div 
        className={`flex-1 overflow-y-auto p-4 pt-2 space-y-2 scrollbar-light ${collapsed ? "px-2" : ""}`}
        data-lenis-prevent
      >
        {filteredLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isSelected={location.id === selectedLocationId}
            onClick={() => onLocationSelect(location.id)}
            collapsed={collapsed}
          />
        ))}
        
        {/* Add Location Button */}
        {collapsed ? (
          <button 
            className="w-full flex items-center justify-center p-2 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
            title="Add Location"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Location</span>
          </button>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <button 
          className={`
            w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700
            ${collapsed ? "justify-center" : ""}
          `}
          title="Manage Locations"
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Manage Locations</span>}
        </button>
      </div>
    </div>
  )
}