// components/dashboard/incident-feed.tsx
'use client';

import { useState } from 'react';
import { Shield, Radio, Newspaper, MapPin, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentFeedProps {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
  selectedId?: string;
}

type FeedTab = 'all' | 'crime' | 'news';

const crimeCategories = ['violent_crime', 'property_crime', 'drugs'];

export function IncidentFeed({ incidents, onSelect, selectedId }: IncidentFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('all');

  const filteredIncidents = incidents.filter(incident => {
    if (activeTab === 'all') return true;
    if (activeTab === 'crime') return crimeCategories.includes(incident.category);
    if (activeTab === 'news') return !crimeCategories.includes(incident.category);
    return true;
  });

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-stone-200 dark:border-zinc-800">
        {[
          { id: 'all', label: 'All', count: incidents.length },
          { id: 'crime', label: 'Crime', count: incidents.filter(i => crimeCategories.includes(i.category)).length },
          { id: 'news', label: 'News & Alerts', count: incidents.filter(i => !crimeCategories.includes(i.category)).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FeedTab)}
            className={`
              px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors relative flex items-center gap-2
              ${activeTab === tab.id 
                ? 'text-orange-500' 
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }
            `}
          >
            {tab.label}
            <span className={`
              px-1.5 py-0.5 rounded text-[10px]
              ${activeTab === tab.id 
                ? 'bg-orange-500/10 text-orange-500' 
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-400'
              }
            `}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => (
          <FeedItem 
            key={incident.id} 
            incident={incident} 
            onClick={() => onSelect(incident)}
            isSelected={selectedId === incident.id}
          />
        ))}
        
        {filteredIncidents.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-stone-400">No incidents in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedItem({ 
  incident, 
  onClick,
  isSelected
}: { 
  incident: Incident;
  onClick: () => void;
  isSelected?: boolean;
}) {
  const urgencyColor = incident.urgency_score >= 7 
    ? 'bg-red-500' 
    : incident.urgency_score >= 4 
      ? 'bg-orange-500' 
      : 'bg-blue-500';

  const urgencyGlow = incident.urgency_score >= 7 
    ? 'shadow-red-500/20' 
    : incident.urgency_score >= 4 
      ? 'shadow-orange-500/20' 
      : 'shadow-blue-500/20';

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
      className={`
        group relative bg-white dark:bg-zinc-900/80 
        border border-stone-200 dark:border-zinc-800 
        rounded-xl p-4 cursor-pointer 
        transition-all duration-200
        hover:border-stone-300 dark:hover:border-zinc-700 
        hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-black/20
        ${isSelected ? 'ring-2 ring-orange-500 border-orange-500' : ''}
      `}
    >
      {/* Urgency indicator line */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 ${urgencyColor} rounded-full`} />

      <div className="flex gap-4 pl-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-lg tracking-tight group-hover:text-orange-500 transition-colors">
                  {incident.incident_type.replace(/_/g, ' ').toUpperCase()}
                </h3>
                {incident.review_status === 'unverified' && (
                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-mono uppercase tracking-wider rounded">
                    Unverified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {(incident.address || incident.city) && (
                  <span className="flex items-center gap-1 text-stone-500">
                    <MapPin className="w-3 h-3" />
                    <span className="font-mono text-[11px]">
                      {incident.address || incident.city}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-[11px]">
                    {formatTimeAgo(incident.occurred_at)}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Urgency badge */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center 
                ${incident.urgency_score >= 7 
                  ? 'bg-red-500/10 text-red-500' 
                  : incident.urgency_score >= 4 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'bg-blue-500/10 text-blue-500'
                }
              `}>
                <span className="font-display text-sm">{incident.urgency_score}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </div>

          {/* Description */}
          <p className="font-mono text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2 leading-relaxed">
            {incident.description}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            {/* Source badges */}
            <div className="flex items-center gap-2">
              {incident.source_types.map((type) => (
                <span 
                  key={type}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 rounded-md"
                >
                  {sourceIcons[type]}
                  {sourceLabels[type] || type}
                </span>
              ))}
              {incident.report_count > 1 && (
                <span className="font-mono text-[10px] text-stone-400">
                  +{incident.report_count - 1} more
                </span>
              )}
            </div>
            
            {/* Category */}
            <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 capitalize">
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
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
