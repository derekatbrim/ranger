// components/app/left-nav.tsx
"use client"

import { cn } from "@/lib/utils"
import { 
  Activity,
  Map, 
  TrendingUp,
  Bell, 
  Eye, 
  User,
  MoreHorizontal
} from "lucide-react"
import type { ViewType } from "@/lib/mock-data"

interface LeftNavProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const navItems = [
  { id: "pulse" as ViewType, icon: Activity, label: "Pulse" },
  { id: "map" as ViewType, icon: Map, label: "Map" },
  { id: "forecast" as ViewType, icon: TrendingUp, label: "Forecast" },
  { id: "alerts" as ViewType, icon: Bell, label: "Alerts" },
  { id: "watchlist" as ViewType, icon: Eye, label: "Watchlist" },
  { id: "profile" as ViewType, icon: User, label: "Profile" },
]

export function LeftNav({ currentView, onViewChange }: LeftNavProps) {
  return (
    <nav className="sticky top-0 h-screen w-[250px] flex flex-col px-3 py-2 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="px-3 py-3">
        <a href="/app" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
            Raven
          </span>
        </a>
      </div>

      {/* Navigation Items */}
      <div className="mt-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left",
                isActive 
                  ? "font-semibold text-gray-900 bg-gray-100" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5",
                  isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                )} 
              />
              <span className="text-[15px]">{item.label}</span>
            </button>
          )
        })}

        {/* More button */}
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <MoreHorizontal className="w-5 h-5 stroke-[1.5px]" />
          <span className="text-[15px]">More</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile at Bottom */}
      <div className="mb-3">
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm text-gray-900">Guest User</div>
            <div className="text-xs text-gray-500">Crystal Lake, IL</div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </nav>
  )
}