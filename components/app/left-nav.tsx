// components/app/left-nav.tsx
"use client"

import { cn } from "@/lib/utils"
import { 
  Home, 
  Map, 
  Bell, 
  Eye, 
  User,
  MoreHorizontal,
  Settings
} from "lucide-react"
import type { ViewType } from "@/app/app/page"

interface LeftNavProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const navItems = [
  { id: "feed" as ViewType, icon: Home, label: "Feed" },
  { id: "map" as ViewType, icon: Map, label: "Map" },
  { id: "alerts" as ViewType, icon: Bell, label: "Alerts" },
  { id: "watchlist" as ViewType, icon: Eye, label: "Watchlist" },
  { id: "profile" as ViewType, icon: User, label: "Profile" },
]

export function LeftNav({ currentView, onViewChange }: LeftNavProps) {
  return (
    <nav className="sticky top-0 h-screen w-[275px] flex flex-col px-3 py-2 border-r border-gray-200">
      {/* Logo */}
      <div className="px-3 py-3">
        <a href="/app" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
            Ranger
          </span>
        </a>
      </div>

      {/* Navigation Items */}
      <div className="mt-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-left",
                isActive 
                  ? "font-bold text-gray-900" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6",
                  isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                )} 
              />
              <span className="text-xl">{item.label}</span>
            </button>
          )
        })}

        {/* More button */}
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-left text-gray-700 hover:bg-gray-100">
          <MoreHorizontal className="w-6 h-6 stroke-[1.5px]" />
          <span className="text-xl">More</span>
        </button>
      </div>

      {/* Report Button */}
      <div className="mt-4 px-3">
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors text-lg">
          Report
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile at Bottom */}
      <div className="mb-3">
        <button className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-sm text-gray-900">Guest User</div>
            <div className="text-sm text-gray-500">Crystal Lake, IL</div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </nav>
  )
}
