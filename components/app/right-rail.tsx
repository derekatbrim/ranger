// components/app/right-rail.tsx
"use client"

import { Search, MoreHorizontal, TrendingUp, Clock, ChevronRight } from "lucide-react"

const todaysNews = [
  {
    id: "1",
    title: "McHenry County Board Approves New Zoning Regulations",
    time: "2 hours ago",
    category: "Civic",
  },
  {
    id: "2",
    title: "Crystal Lake Police Report Decline in Property Crime",
    time: "4 hours ago",
    category: "Safety",
  },
  {
    id: "3",
    title: "Route 14 Construction Enters Final Phase",
    time: "6 hours ago",
    category: "Infrastructure",
  },
]

export function RightRail() {
  return (
    <div className="w-[380px] h-full flex flex-col border-l border-gray-200 hidden lg:flex bg-white">
      {/* Fixed search area */}
      <div className="flex-shrink-0 p-4 bg-white">
        {/* Search - rounded corners */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Raven"
            className="w-full bg-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white border border-transparent focus:border-gray-200 transition-all"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">

      {/* Stability Overview Card */}
      <div className="bg-gray-50 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Your Area</h2>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated 8:00 AM
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-900">Stable</span>
          <span className="text-lg font-semibold text-emerald-600">87/100</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          No emerging disruptions across your pinned locations. Property crime slightly down this week.
        </p>
        <button className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors">
          View details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Today's News */}
      <div className="bg-gray-50 rounded-xl overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-semibold text-gray-900">Today's News</h2>
        </div>

        <div>
          {todaysNews.map((item, index) => (
            <a
              key={item.id}
              href="#"
              className="block px-5 py-4 hover:bg-gray-100 transition-colors border-t border-gray-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-[15px] text-gray-900 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => e.preventDefault()}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </a>
          ))}
        </div>

        <a href="#" className="block px-5 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm font-medium border-t border-gray-100">
          Show more
        </a>
      </div>

      {/* 7-Day Outlook */}
      <div className="bg-gray-50 rounded-xl p-5 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">7-Day Outlook</h2>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
            Stable
          </span>
          <span className="text-gray-300">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
            Stable
          </span>
          <span className="text-gray-300">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
            Watchful
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Minor traffic disruptions expected mid-week.
        </p>
      </div>

      {/* Footer links */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Cookies</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Accessibility</a>
          <span>© 2026 Raven</span>
        </div>
      </div>
      </div>
    </div>
  )
}