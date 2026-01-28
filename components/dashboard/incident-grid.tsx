// components/dashboard/incident-grid.tsx
'use client';

import { useState } from 'react';
import { Shield, Radio, Newspaper, MapPin, Clock, ChevronRight } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentGridProps {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
}

type FeedTab = 'all' | 'crime' | 'news';

const crimeCategories = ['violent_crime', 'property_crime', 'drugs'];

export function IncidentGrid({ incidents, onSelect }: IncidentGridProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('all');

  const filteredIncidents = incidents.filter(incident => {
    if (activeTab === 'all') return true;
    if (activeTab === 'crime') return crimeCategories.includes(incident.category);
    if (activeTab === 'news') return !crimeCategories.includes(incident.category);
    return true;
  });

  return (
    <div className="max-w-2xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-200 dark:border-zinc-800">
        {[
          { id: 'all', label: 'All' },
          { id: 'crime', label: 'Crime' },
          { id: 'news', label: 'News & Alerts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FeedTab)}
            className={`
              px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors relative
              ${activeTab === tab.id 
                ? 'text-orange-500' 
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <FeedCard 
            key={incident.id} 
            incident={incident} 
            onClick={() => onSelect(incident)}
          />
        ))}
        
        {filteredIncidents.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-mono text-sm text-stone-400">No incidents in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ 
  incident, 
  onClick 
}: { 
  incident: Incident;
  onClick: () => void;
}) {
  const urgencyColor = incident.urgency_score >= 7 
    ? 'bg-red-500' 
    : incident.urgency_score >= 4 
      ? 'bg-orange-500' 
      : 'bg-blue-500';

  const sourceIcons: Record<string, React.ReactNode> = {
    api: <Shield className="w-3 h-3" />,
    audio: <Radio className="w-3 h-3" />,
    html: <Newspaper className="w-3 h-3" />,
  };

  const sourceLabels: Record<string, string> = {
    api: 'Official',
    audio: 'Scanner',
    html: 'News',
  };

  return (
    <article 
      onClick={onClick}
      className="group bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-4 cursor-pointer hover:border-stone-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-stone-100 dark:hover:shadow-black/10"
    >
      <div className="flex gap-4">
        {/* Urgency indicator */}
        <div className="flex-shrink-0 pt-1">
          <div className={`w-3 h-3 rounded-full ${urgencyColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-display text-xl tracking-tight group-hover:text-orange-500 transition-colors">
                {incident.incident_type.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                {(incident.address || incident.city) && (
                  <span className="flex items-center gap-1 text-stone-400">
                    <MapPin className="w-3 h-3" />
                    <span className="font-mono text-xs">
                      {incident.city || incident.address}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-xs">
                    {formatTimeAgo(incident.occurred_at)}
                  </span>
                </span>
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
          </div>

          {/* Description */}
          <p className="font-mono text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
            {incident.description}
          </p>

          {/* Source badges */}
          <div className="flex items-center gap-2">
            {incident.source_types.map((type) => (
              <span 
                key={type}
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 rounded"
              >
                {sourceIcons[type]}
                {sourceLabels[type] || type}
              </span>
            ))}
            
            <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 ml-auto">
              {incident.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </article>
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