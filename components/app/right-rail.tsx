// components/app/right-rail.tsx
"use client"

import { Search, X, MoreHorizontal } from "lucide-react"

const todaysNews = [
  {
    id: "1",
    title: "McHenry County Board Approves New Zoning Regulations",
    time: "2 hours ago",
    category: "Civic",
    posts: "1.2K posts",
  },
  {
    id: "2",
    title: "Crystal Lake Police Report Decline in Property Crime",
    time: "4 hours ago",
    category: "Safety",
    posts: "856 posts",
  },
  {
    id: "3",
    title: "Route 14 Construction Enters Final Phase",
    time: "6 hours ago",
    category: "Infrastructure",
    posts: "2.1K posts",
  },
]

const trending = [
  { id: "1", category: "Safety · Trending", topic: "#PackageTheft", posts: "1,234 posts" },
  { id: "2", category: "Civic · Trending", topic: "Liquor License Vote", posts: "892 posts" },
  { id: "3", category: "Local · Trending", topic: "Snow Removal", posts: "3,456 posts" },
  { id: "4", category: "Safety · Trending", topic: "#DUICheckpoint", posts: "567 posts" },
]

export function RightRail() {
  return (
    <div className="w-[350px] pl-6 pr-4 py-2 hidden lg:block">
      <div className="sticky top-0 pt-1 pb-3 bg-white">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Ranger"
            className="w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Today's News */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden mt-3">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Today's News</h2>
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div>
          {todaysNews.map((item) => (
            <a
              key={item.id}
              href="#"
              className="block px-4 py-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] text-gray-900 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{item.time}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                    <span>·</span>
                    <span>{item.posts}</span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </a>
          ))}
        </div>

        <a href="#" className="block px-4 py-3 text-orange-500 hover:bg-gray-100 transition-colors text-sm">
          Show more
        </a>
      </div>

      {/* Trending */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden mt-4">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold text-gray-900">Trending in Your Area</h2>
        </div>

        <div>
          {trending.map((item) => (
            <a
              key={item.id}
              href="#"
              className="block px-4 py-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[13px] text-gray-500">{item.category}</div>
                  <div className="font-bold text-[15px] text-gray-900 mt-0.5">{item.topic}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{item.posts}</div>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </a>
          ))}
        </div>

        <a href="#" className="block px-4 py-3 text-orange-500 hover:bg-gray-100 transition-colors text-sm">
          Show more
        </a>
      </div>

      {/* Footer links */}
      <div className="mt-4 px-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-gray-500">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">More</a>
          <span>© 2026 Ranger</span>
        </div>
      </div>
    </div>
  )
}
