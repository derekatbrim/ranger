// components/app/home-view.tsx
"use client"

import { 
  CURRENT_LOCATION, 
  WEEKLY_TREND
} from "@/lib/raven-data"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle,
  Construction,
  Landmark,
  Clock,
  Map,
  ChevronRight,
  Zap,
  FileText,
  Calendar
} from "lucide-react"
import { ScoreFlap } from "./score-flap"

// ============================================
// HERO: Stability Score with Split-Flap
// ============================================
function ScoreHero() {
  const location = CURRENT_LOCATION
  
  const trendIcon = location.trend === "improving" 
    ? <TrendingUp className="w-4 h-4" />
    : location.trend === "declining"
    ? <TrendingDown className="w-4 h-4" />
    : <Minus className="w-4 h-4" />
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-600"
    : location.trend === "declining"
    ? "text-rose-600"
    : "text-slate-500"

  return (
    <div className="text-center py-8 px-4">
      <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Stability Index</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-4">{location.name}</h1>
      
      {/* Split-flap score */}
      <div className="flex justify-center mb-4">
        <ScoreFlap score={location.stabilityScore} />
      </div>
      
      <div className={`flex items-center justify-center gap-1.5 ${trendColor}`}>
        {trendIcon}
        <span className="text-sm font-medium">
          {location.trend === "stable" ? "Stable" : `${location.trendPercent > 0 ? "+" : ""}${location.trendPercent}%`}
        </span>
        <span className="text-slate-400 text-sm">vs last week</span>
      </div>
      <p className="text-slate-500 text-sm mt-1">{location.briefStatus}</p>
    </div>
  )
}

// ============================================
// EMERGING PATTERN - The Killer Feature
// ============================================
function EmergingPatternCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-50">
          <Zap className="w-5 h-5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Emerging Pattern</p>
          <h3 className="font-semibold text-slate-900 text-lg">Vehicle Break-ins Identified</h3>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-rose-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">↑ 23% over 3 weeks</span>
            </div>
            <span className="text-sm text-slate-500">11pm – 3am</span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">What it means:</span> Concentrated around Main St parking lots. Avoid leaving valuables in unsecured vehicles overnight.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ACTIVE DISRUPTIONS - Infrastructure Issues
// ============================================
interface Disruption {
  id: string
  type: "road" | "water" | "power" | "transit"
  title: string
  impact: string
  until?: string
}

const MOCK_DISRUPTIONS: Disruption[] = [
  {
    id: "1",
    type: "road",
    title: "Route 14 Eastbound Closure",
    impact: "Commute delays expected",
    until: "Through Friday"
  },
  {
    id: "2", 
    type: "water",
    title: "Water Main Repair — Walkup Ave",
    impact: "Low pressure possible",
    until: "Est. tomorrow evening"
  }
]

function ActiveDisruptionsCard() {
  const typeIcons = {
    road: Construction,
    water: Construction,
    power: Zap,
    transit: Construction
  }

  if (MOCK_DISRUPTIONS.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Disruptions</h3>
        <span className="ml-auto text-xs text-slate-400">{MOCK_DISRUPTIONS.length} active</span>
      </div>
      
      <div className="space-y-3">
        {MOCK_DISRUPTIONS.map((disruption) => {
          const Icon = typeIcons[disruption.type]
          return (
            <div key={disruption.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <Icon className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-800 text-sm">{disruption.title}</p>
                  {disruption.until && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">{disruption.until}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{disruption.impact}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// CIVIC SIGNALS - Rezoning, Development, etc.
// ============================================
interface CivicSignal {
  id: string
  type: "rezoning" | "development" | "tax" | "event"
  title: string
  implication: string
  date?: string
}

const MOCK_CIVIC_SIGNALS: CivicSignal[] = [
  {
    id: "1",
    type: "rezoning",
    title: "B-2 Commercial Rezoning Approved",
    implication: "Retail expansion likely on Virginia St corridor",
    date: "Effective Feb 15"
  },
  {
    id: "2",
    type: "development",
    title: "Mixed-Use Development Permit Filed",
    implication: "150 residential units + ground floor retail proposed",
    date: "Public hearing Mar 5"
  }
]

function CivicSignalsCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Landmark className="w-4 h-4 text-sky-500" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Civic Signals</h3>
      </div>
      
      <div className="space-y-4">
        {MOCK_CIVIC_SIGNALS.map((signal) => (
          <div key={signal.id} className="group">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-slate-800 text-sm group-hover:text-sky-600 cursor-pointer transition-colors">
                {signal.title}
              </h4>
              {signal.date && (
                <span className="text-xs text-slate-400 whitespace-nowrap">{signal.date}</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">{signal.implication}</p>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 pt-3 border-t border-slate-100 text-sm text-sky-600 font-medium hover:text-sky-700 flex items-center justify-center gap-1">
        View all civic activity <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================
// TEMPORAL RISK WINDOWS - Peak Hours Interpreted
// ============================================
function TemporalWindowsCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Activity Windows</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Higher Activity Window</span>
            <span className="text-sm font-semibold text-slate-900">11PM – 2AM</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Typical for downtown corridor. Property incidents concentrate in this window.</p>
        </div>
        
        <div className="h-px bg-slate-100" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Quietest Period</span>
            <span className="text-sm font-semibold text-emerald-600">3AM – 7AM</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Consistently low activity. Residential areas stable.</p>
        </div>
        
        <div className="h-px bg-slate-100" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Rush Hour Impact</span>
            <span className="text-sm font-semibold text-amber-600">5PM – 7PM</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Minor vehicle incidents typical. Route 14 closure adding 15-20 min delays.</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 7-DAY TREND - Like Weather Daily Forecast
// ============================================
function WeeklyTrendCard() {
  const trend = WEEKLY_TREND

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">7-Day Overview</h3>
      </div>
      
      <div className="divide-y divide-slate-100">
        {trend.map((day, i) => {
          const isToday = day.day === "Today"
          const scoreColor = day.score >= 75 ? "text-emerald-600" : day.score >= 65 ? "text-sky-600" : day.score >= 50 ? "text-amber-600" : "text-rose-600"
          const barColor = day.score >= 75 ? "bg-emerald-500" : day.score >= 65 ? "bg-sky-500" : day.score >= 50 ? "bg-amber-500" : "bg-rose-500"
          
          return (
            <button 
              key={i} 
              className={`w-full flex items-center gap-4 py-3 hover:bg-slate-50 transition-colors ${isToday ? "bg-slate-50" : ""}`}
            >
              <div className="w-14">
                <span className={`text-sm ${isToday ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                  {day.day}
                </span>
              </div>
              
              {/* Incidents indicator */}
              <div className="flex items-center gap-1 w-12">
                <FileText className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">{day.incidents}</span>
              </div>
              
              {/* Score bar visualization */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-sm text-slate-400 w-6">{day.low}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full relative">
                  <div 
                    className={`absolute h-full ${barColor} rounded-full`}
                    style={{ 
                      left: `${((day.low - 50) / 40) * 100}%`,
                      width: `${((day.high - day.low) / 40) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-slate-700 font-medium w-6">{day.high}</span>
              </div>
              
              {/* Score */}
              <div className={`text-right w-10 ${scoreColor} font-semibold`}>
                {day.score}
              </div>
              
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// MAP PREVIEW
// ============================================
function MapPreviewCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Activity Map</h3>
        </div>
        <button 
          onClick={onNavigateToMap}
          className="text-sky-600 text-sm font-medium flex items-center gap-1 hover:text-sky-700"
        >
          Open <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="relative h-44 bg-slate-100">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Simplified heat map visualization */}
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-80">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
              <radialGradient id="heat1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="heat2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="200" height="120" fill="url(#grid)"/>
            <circle cx="100" cy="50" r="35" fill="url(#heat1)"/>
            <circle cx="60" cy="80" r="25" fill="url(#heat2)"/>
            <circle cx="100" cy="60" r="4" fill="#0f172a"/>
            <circle cx="100" cy="60" r="8" fill="none" stroke="#0f172a" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-slate-600">
          2 active zones
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN HOME VIEW
// ============================================
export function HomeView({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  return (
    <div 
      className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white scrollbar-light"
      data-lenis-prevent
    >
      <div className="max-w-xl mx-auto px-4 pb-12">
        {/* Hero Score */}
        <ScoreHero />
        
        {/* Emerging Pattern - The most important card */}
        <div className="mb-4">
          <EmergingPatternCard />
        </div>
        
        {/* Active Disruptions */}
        <div className="mb-4">
          <ActiveDisruptionsCard />
        </div>
        
        {/* Civic Signals */}
        <div className="mb-4">
          <CivicSignalsCard />
        </div>
        
        {/* Temporal Risk Windows */}
        <div className="mb-4">
          <TemporalWindowsCard />
        </div>
        
        {/* 7-Day Trend */}
        <div className="mb-4">
          <WeeklyTrendCard />
        </div>
        
        {/* Map Preview */}
        <div className="mb-4">
          <MapPreviewCard onNavigateToMap={onNavigateToMap} />
        </div>
      </div>
    </div>
  )
}