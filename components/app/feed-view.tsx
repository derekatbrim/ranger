// components/app/feed-view.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Building2, 
  Construction, 
  Clock, 
  CheckCircle2,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal
} from "lucide-react"
import type { Incident } from "@/app/app/page"

interface FeedViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const tabs = [
  { id: "for-you", label: "For You" },
  { id: "safety", label: "Safety" },
  { id: "civic", label: "Civic" },
  { id: "infrastructure", label: "Infrastructure" },
]

const typeConfig = {
  crime: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "text-gray-600",
    bgColor: "bg-gray-100",
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

  const filteredIncidents = activeTab === "for-you" 
    ? incidents 
    : incidents.filter(i => {
        if (activeTab === "safety") return i.type === "crime"
        if (activeTab === "civic") return i.type === "civic"
        if (activeTab === "infrastructure") return i.type === "infrastructure"
        return true
      })

  return (
    <div className="w-[600px] border-x border-gray-200 min-h-screen">
      {/* Header with tabs */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200">
        {/* Title bar */}
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Feed</h1>
        </div>

        {/* Tabs */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-4 text-sm font-medium transition-colors relative hover:bg-gray-50",
                activeTab === tab.id ? "text-gray-900" : "text-gray-500"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed items */}
      <div>
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

  return (
    <article 
      onClick={onSelect}
      className={cn(
        "px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors",
        isSelected && "bg-orange-50 hover:bg-orange-50"
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 text-sm">
            <span className={cn("font-bold", config.color)}>{config.label}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{incident.municipality}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatTimeAgo(incident.timestamp)}</span>
            {incident.verified && (
              <>
                <CheckCircle2 className="w-4 h-4 text-orange-500 fill-orange-500" />
              </>
            )}
            <button className="ml-auto p-1 hover:bg-gray-200 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 mt-0.5 leading-snug">
            {incident.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-700 mt-1 text-[15px] leading-normal">
            {incident.summary}
          </p>

          {/* Location badge */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {incident.location}
            </span>
          </div>

          {/* Engagement row */}
          <div className="flex items-center justify-between mt-3 max-w-[400px]">
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">{incident.engagement.comments}</span>
            </button>

            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Share className="w-4 h-4" />
              </div>
              <span className="text-sm">{incident.engagement.shares}</span>
            </button>

            <button className="flex items-center gap-2 text-gray-500 hover:text-orange-500 group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-orange-50 transition-colors">
                <Bookmark className="w-4 h-4" />
              </div>
            </button>

            <button className="flex items-center gap-2 text-gray-500 hover:text-orange-500 group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-orange-50 transition-colors">
                <Share className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}