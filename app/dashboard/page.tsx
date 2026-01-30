// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardMap } from '@/components/dashboard/map';
import { StatsOverlay } from '@/components/dashboard/stats-overlay';
import { IncidentPanel } from '@/components/dashboard/incident-panel';
import { IncidentFeed } from '@/components/dashboard/incident-feed';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { MapPin, Activity, TrendingUp, Clock, AlertTriangle, Radio } from 'lucide-react';

export interface Incident {
  id: string;
  incident_type: string;
  category: string;
  title?: string;
  description: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  occurred_at: string;
  urgency_score: number;
  confidence_score: number;
  review_status: string;
  report_count: number;
  source_types: string[];
  image_url?: string;
}

export type TabType = 'overview' | 'incidents' | 'alerts' | 'trends';

export default function DashboardPage() {
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Set light mode for dashboard by default
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Cleanup: restore dark mode when leaving dashboard
    return () => {
      document.documentElement.classList.add('dark');
    };
  }, []);

  const handleSelectIncident = (incident: Incident | null) => {
    setSelectedIncident(incident);
    if (incident) setPanelOpen(true);
  };

  // Stats calculations
  const stats = useMemo(() => {
    const now = Date.now();
    const last24h = incidents.filter(i => now - new Date(i.occurred_at).getTime() < 24 * 60 * 60 * 1000);
    const highPriority = incidents.filter(i => i.urgency_score >= 7);
    const categories = incidents.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    
    return { last24h: last24h.length, highPriority: highPriority.length, topCategory };
  }, [incidents]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-100 dark:bg-zinc-950 text-stone-900 dark:text-stone-100">
      {/* Glass sidebar */}
      <DashboardSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main content */}
      <main className="ml-20 h-full relative">
        {/* Top header bar */}
        <header className="absolute top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
              Raven
            </span>
            <span className="text-stone-300 dark:text-stone-700">—</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                McHenry County, IL
              </span>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Live</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Overview - Map with stats */}
        {activeTab === 'overview' && (
          <>
            <DashboardMap 
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelect={handleSelectIncident}
            />
            <StatsOverlay incidents={incidents} />
          </>
        )}

        {/* Incidents feed view - Two column layout */}
        {activeTab === 'incidents' && (
          <div className="h-full pt-16 flex">
            {/* Main feed column */}
            <div className="flex-1 px-6 pb-6 overflow-auto">
              <div className="max-w-4xl">
                <div className="mb-6 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                    All Incidents
                  </span>
                  <h1 className="font-display text-4xl tracking-tight mt-1">RECENT ACTIVITY</h1>
                </div>
                <IncidentFeed 
                  incidents={incidents} 
                  onSelect={handleSelectIncident}
                  selectedId={selectedIncident?.id}
                />
              </div>
            </div>

            {/* Right sidebar - Activity summary */}
            <aside className="w-80 border-l border-stone-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-6 overflow-auto hidden lg:block">
              <div className="space-y-6">
                {/* Quick stats */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <QuickStatCard 
                      icon={<Clock className="w-4 h-4" />}
                      label="Last 24h"
                      value={stats.last24h}
                    />
                    <QuickStatCard 
                      icon={<AlertTriangle className="w-4 h-4" />}
                      label="High Priority"
                      value={stats.highPriority}
                      accent
                    />
                    <QuickStatCard 
                      icon={<Activity className="w-4 h-4" />}
                      label="Total"
                      value={incidents.length}
                    />
                    <QuickStatCard 
                      icon={<Radio className="w-4 h-4" />}
                      label="Sources"
                      value={new Set(incidents.flatMap(i => i.source_types)).size}
                    />
                  </div>
                </div>

                {/* Category breakdown */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
                    By Category
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(
                      incidents.reduce((acc, i) => {
                        acc[i.category] = (acc[i.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, count]) => (
                        <CategoryBar key={category} category={category} count={count} total={incidents.length} />
                      ))}
                  </div>
                </div>

                {/* Recent activity timeline */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    {incidents.slice(0, 5).map((incident) => (
                      <button
                        key={incident.id}
                        onClick={() => handleSelectIncident(incident)}
                        className="w-full text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            incident.urgency_score >= 7 ? 'bg-red-500' :
                            incident.urgency_score >= 4 ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-stone-600 dark:text-stone-300 truncate group-hover:text-orange-500 transition-colors">
                              {incident.incident_type.replace(/_/g, ' ')}
                            </p>
                            <p className="font-mono text-[10px] text-stone-400">
                              {formatTimeAgo(incident.occurred_at)} · {incident.city}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Alerts tab placeholder */}
        {activeTab === 'alerts' && (
          <div className="h-full pt-20 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl tracking-tight mt-2">ALERTS</h1>
              <p className="font-mono text-sm text-stone-500 mt-4 max-w-md mx-auto">
                Configure push notifications for specific incident types, locations, or severity levels.
              </p>
            </div>
          </div>
        )}

        {/* Trends tab placeholder */}
        {activeTab === 'trends' && (
          <div className="h-full pt-20 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl tracking-tight mt-2">TRENDS</h1>
              <p className="font-mono text-sm text-stone-500 mt-4 max-w-md mx-auto">
                Crime statistics, historical comparisons, and neighborhood safety scores.
              </p>
            </div>
          </div>
        )}

        {/* Slide-out detail panel */}
        <IncidentPanel 
          incident={selectedIncident}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
        />
      </main>
    </div>
  );
}

// Helper components
function QuickStatCard({ icon, label, value, accent = false }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`p-3 rounded-xl ${accent ? 'bg-orange-500/10' : 'bg-stone-100 dark:bg-zinc-800/50'}`}>
      <div className={`mb-1 ${accent ? 'text-orange-500' : 'text-stone-400'}`}>{icon}</div>
      <p className="font-display text-xl tracking-tight">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400">{label}</p>
    </div>
  );
}

function CategoryBar({ category, count, total }: { category: string; count: number; total: number }) {
  const percentage = (count / total) * 100;
  const colors: Record<string, string> = {
    violent_crime: 'bg-red-500',
    property_crime: 'bg-orange-500',
    fire: 'bg-amber-500',
    traffic: 'bg-blue-500',
    drugs: 'bg-purple-500',
    missing_person: 'bg-pink-500',
    other: 'bg-stone-400',
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 capitalize">
          {category.replace('_', ' ')}
        </span>
        <span className="font-mono text-[10px] text-stone-400">{count}</span>
      </div>
      <div className="h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[category] || colors.other} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    incident_type: 'shooting',
    category: 'violent_crime',
    description: 'Two men arrested following shots fired call in the 100 block of North Main Street. No injuries reported. Suspects fled on foot before being apprehended near Dole Avenue.',
    address: '100 block N Main St',
    city: 'Crystal Lake',
    latitude: 42.2411,
    longitude: -88.3162,
    occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    urgency_score: 8,
    confidence_score: 0.92,
    review_status: 'verified',
    report_count: 3,
    source_types: ['audio', 'html', 'api'],
  },
  {
    id: '2',
    incident_type: 'vehicle_breakins',
    category: 'property_crime',
    description: 'Six vehicles targeted overnight in Fox Trails subdivision. No suspects identified. Residents urged to lock vehicles.',
    address: 'Fox Trails',
    city: 'Cary',
    latitude: 42.2120,
    longitude: -88.2378,
    occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    urgency_score: 4,
    confidence_score: 0.85,
    review_status: 'verified',
    report_count: 1,
    source_types: ['html'],
  },
  {
    id: '3',
    incident_type: 'structure_fire',
    category: 'fire',
    description: 'Garage fire on Oak Street. Fire department responded within 4 minutes. No injuries reported. Cause under investigation.',
    address: '2500 Oak St',
    city: 'McHenry',
    latitude: 42.3336,
    longitude: -88.2668,
    occurred_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    urgency_score: 6,
    confidence_score: 0.95,
    review_status: 'verified',
    report_count: 2,
    source_types: ['audio', 'api'],
  },
  {
    id: '4',
    incident_type: 'missing_person',
    category: 'missing_person',
    description: 'Silver Alert issued for 78-year-old man last seen in Woodstock. Driving silver Honda Accord, IL plates.',
    city: 'Woodstock',
    latitude: 42.3147,
    longitude: -88.4487,
    occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    urgency_score: 7,
    confidence_score: 1.0,
    review_status: 'verified',
    report_count: 2,
    source_types: ['api', 'html'],
  },
  {
    id: '5',
    incident_type: 'traffic_accident',
    category: 'traffic',
    description: 'Multi-vehicle accident on Route 31 near Algonquin Road. Injuries reported. Expect significant delays.',
    address: 'Route 31 & Algonquin Rd',
    city: 'Algonquin',
    latitude: 42.1656,
    longitude: -88.2945,
    occurred_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    urgency_score: 5,
    confidence_score: 0.78,
    review_status: 'unverified',
    report_count: 1,
    source_types: ['audio'],
  },
  {
    id: '6',
    incident_type: 'drug_arrest',
    category: 'drugs',
    description: 'Traffic stop on Route 14 leads to drug arrest. Driver found in possession of controlled substances.',
    address: 'Route 14',
    city: 'Crystal Lake',
    latitude: 42.2350,
    longitude: -88.3200,
    occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    urgency_score: 3,
    confidence_score: 0.88,
    review_status: 'verified',
    report_count: 1,
    source_types: ['api'],
  },
];