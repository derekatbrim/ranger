// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardMap } from '@/components/dashboard/map';
import { StatsOverlay } from '@/components/dashboard/stats-overlay';
import { IncidentPanel } from '@/components/dashboard/incident-panel';
import { IncidentGrid } from '@/components/dashboard/incident-grid';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { MapPin } from 'lucide-react';

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
              Ranger
            </span>
            <span className="text-stone-300 dark:text-stone-700">—</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                McHenry County, IL
              </span>
            </div>
          </div>
          <div className="pointer-events-auto">
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

        {/* Incidents grid view */}
        {activeTab === 'incidents' && (
          <div className="h-full pt-20 px-6 pb-6 overflow-auto">
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                All Incidents
              </span>
              <h1 className="font-display text-5xl tracking-tight mt-2">RECENT ACTIVITY</h1>
            </div>
            <IncidentGrid 
              incidents={incidents} 
              onSelect={handleSelectIncident}
            />
          </div>
        )}

        {/* Alerts tab placeholder */}
        {activeTab === 'alerts' && (
          <div className="h-full pt-20 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl tracking-tight mt-2">ALERTS</h1>
              <p className="font-mono text-sm text-stone-500 mt-4 max-w-md">
                Configure push notifications for specific incident types or areas.
              </p>
            </div>
          </div>
        )}

        {/* Trends tab placeholder */}
        {activeTab === 'trends' && (
          <div className="h-full pt-20 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl tracking-tight mt-2">TRENDS</h1>
              <p className="font-mono text-sm text-stone-500 mt-4 max-w-md">
                Crime statistics, historical data, and neighborhood comparisons.
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