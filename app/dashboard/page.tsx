'use client';

import { useState, useEffect } from 'react';
import { IncidentFeed } from '@/components/dashboard/incident-feed';
import { IncidentMap } from '@/components/dashboard/incident-map';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { StatsBar } from '@/components/dashboard/stats-bar';
import { Shield, Map, List, RefreshCw } from 'lucide-react';

// Types
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
  location_resolution?: string;
}

export interface Filters {
  category: string | null;
  timeRange: '24h' | '7d' | '30d' | 'all';
  city: string | null;
  minUrgency: number;
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map' | 'split'>('split');
  const [filters, setFilters] = useState<Filters>({
    category: null,
    timeRange: '7d',
    city: null,
    minUrgency: 1,
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Fetch incidents
  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.timeRange !== 'all') params.set('timeRange', filters.timeRange);
      if (filters.city) params.set('city', filters.city);
      if (filters.minUrgency > 1) params.set('minUrgency', String(filters.minUrgency));
      
      const res = await fetch(`/api/incidents?${params}`);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Use mock data for development
      setIncidents(MOCK_INCIDENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  // Filter incidents client-side for immediate feedback
  const filteredIncidents = incidents.filter(inc => {
    if (filters.category && inc.category !== filters.category) return false;
    if (filters.city && inc.city !== filters.city) return false;
    if (inc.urgency_score < filters.minUrgency) return false;
    return true;
  });

  // Get unique cities for filter dropdown
  const cities = Array.from(new Set(incidents.map(i => i.city).filter((c): c is string => Boolean(c))));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-500" />
            <span className="font-semibold text-lg">Ranger</span>
            <span className="text-zinc-500 text-sm hidden sm:inline">McHenry County Intel</span>
          </div>
          
          {/* View toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchIncidents()}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex bg-zinc-900 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded ${view === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('split')}
                className={`p-2 rounded ${view === 'split' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <div className="w-4 h-4 flex gap-0.5">
                  <div className="w-1/2 bg-current rounded-sm" />
                  <div className="w-1/2 bg-current rounded-sm" />
                </div>
              </button>
              <button
                onClick={() => setView('map')}
                className={`p-2 rounded ${view === 'map' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <StatsBar incidents={filteredIncidents} />

      {/* Filter bar */}
      <FilterBar 
        filters={filters} 
        setFilters={setFilters}
        cities={cities}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm">
            Using demo data. Connect Supabase to see real incidents.
          </div>
        )}

        {view === 'list' && (
          <IncidentFeed 
            incidents={filteredIncidents}
            loading={loading}
            selectedIncident={selectedIncident}
            onSelect={setSelectedIncident}
          />
        )}

        {view === 'map' && (
          <div className="h-[calc(100vh-220px)]">
            <IncidentMap 
              incidents={filteredIncidents}
              selectedIncident={selectedIncident}
              onSelect={setSelectedIncident}
            />
          </div>
        )}

        {view === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[calc(100vh-220px)] overflow-auto">
              <IncidentFeed 
                incidents={filteredIncidents}
                loading={loading}
                selectedIncident={selectedIncident}
                onSelect={setSelectedIncident}
              />
            </div>
            <div className="h-[calc(100vh-220px)] hidden lg:block">
              <IncidentMap 
                incidents={filteredIncidents}
                selectedIncident={selectedIncident}
                onSelect={setSelectedIncident}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Mock data for development
const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    incident_type: 'shooting',
    category: 'violent_crime',
    title: 'Shots Fired - Crystal Lake',
    description: 'Two men arrested following shots fired call in the 100 block of North Main Street. No injuries reported. Suspects fled on foot before being apprehended near Dole Avenue.',
    address: '100 block N Main St',
    city: 'Crystal Lake',
    latitude: 42.2411,
    longitude: -88.3162,
    occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    urgency_score: 8,
    confidence_score: 0.92,
    review_status: 'auto_published',
    report_count: 3,
    source_types: ['audio', 'html', 'api'],
    location_resolution: 'block',
  },
  {
    id: '2',
    incident_type: 'burglary',
    category: 'property_crime',
    description: 'Vehicle break-ins reported overnight in Fox Trails subdivision. At least six vehicles targeted. No suspects at this time.',
    address: 'Fox Trails subdivision',
    city: 'Cary',
    latitude: 42.2120,
    longitude: -88.2378,
    occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    urgency_score: 4,
    confidence_score: 0.85,
    review_status: 'auto_published',
    report_count: 1,
    source_types: ['html'],
    location_resolution: 'centroid',
  },
  {
    id: '3',
    incident_type: 'structure_fire',
    category: 'fire',
    description: 'Garage fire on Oak Street. Fire department responded, no injuries. Cause under investigation.',
    address: '2500 Oak St',
    city: 'McHenry',
    latitude: 42.3336,
    longitude: -88.2668,
    occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgency_score: 6,
    confidence_score: 0.95,
    review_status: 'approved',
    report_count: 2,
    source_types: ['audio', 'api'],
    location_resolution: 'parcel',
  },
  {
    id: '4',
    incident_type: 'drug_arrest',
    category: 'drugs',
    description: 'Traffic stop leads to drug arrest on Route 14. Driver found in possession of controlled substances.',
    address: 'Route 14 near Crystal Lake Ave',
    city: 'Crystal Lake',
    latitude: 42.2350,
    longitude: -88.3200,
    occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    urgency_score: 3,
    confidence_score: 0.88,
    review_status: 'auto_published',
    report_count: 1,
    source_types: ['api'],
    location_resolution: 'block',
  },
  {
    id: '5',
    incident_type: 'missing_person',
    category: 'missing_person',
    description: 'Silver Alert issued for 78-year-old man last seen in Woodstock. Driving silver Honda Accord.',
    city: 'Woodstock',
    latitude: 42.3147,
    longitude: -88.4487,
    occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    urgency_score: 7,
    confidence_score: 1.0,
    review_status: 'approved',
    report_count: 2,
    source_types: ['api', 'html'],
    location_resolution: 'centroid',
  },
  {
    id: '6',
    incident_type: 'car_accident',
    category: 'traffic',
    description: 'Multi-vehicle accident on Route 31 near Algonquin Road. Injuries reported. Expect delays.',
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
    location_resolution: 'parcel',
  },
];
