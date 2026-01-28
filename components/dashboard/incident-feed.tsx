'use client';

import { 
  AlertTriangle, 
  Radio, 
  Newspaper, 
  Shield, 
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Flame,
  Car,
  Search,
  User,
  Package
} from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentFeedProps {
  incidents: Incident[];
  loading: boolean;
  selectedIncident: Incident | null;
  onSelect: (incident: Incident | null) => void;
}

// Urgency color mapping
const urgencyColors: Record<number, string> = {
  10: 'bg-red-600',
  9: 'bg-red-500',
  8: 'bg-orange-500',
  7: 'bg-orange-400',
  6: 'bg-yellow-500',
  5: 'bg-yellow-400',
  4: 'bg-blue-400',
  3: 'bg-blue-300',
  2: 'bg-gray-400',
  1: 'bg-gray-300',
};

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
  violent_crime: <AlertTriangle className="w-4 h-4" />,
  property_crime: <Package className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  traffic: <Car className="w-4 h-4" />,
  missing_person: <User className="w-4 h-4" />,
  drugs: <Search className="w-4 h-4" />,
  suspicious: <AlertCircle className="w-4 h-4" />,
  other: <AlertCircle className="w-4 h-4" />,
};

// Source type icons and labels
const sourceConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  audio: { icon: <Radio className="w-3 h-3" />, label: 'Scanner', color: 'text-purple-400' },
  html: { icon: <Newspaper className="w-3 h-3" />, label: 'News', color: 'text-blue-400' },
  api: { icon: <Shield className="w-3 h-3" />, label: 'Official', color: 'text-green-400' },
  rss: { icon: <Newspaper className="w-3 h-3" />, label: 'Feed', color: 'text-blue-400' },
};

// Format relative time
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function IncidentCard({ 
  incident, 
  isSelected, 
  onSelect 
}: { 
  incident: Incident; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  const urgencyColor = urgencyColors[incident.urgency_score] || 'bg-gray-400';
  const isVerified = incident.review_status === 'approved' || incident.review_status === 'auto_published';
  const isUnverified = incident.review_status === 'unverified';
  const categoryIcon = categoryIcons[incident.category] || categoryIcons.other;
  
  return (
    <div 
      onClick={onSelect}
      className={`
        bg-zinc-900 border rounded-lg p-4 cursor-pointer transition-all
        ${isSelected 
          ? 'border-amber-500 ring-1 ring-amber-500/50' 
          : 'border-zinc-800 hover:border-zinc-700'
        }
      `}
    >
      {/* Header: Type + Urgency + Time */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Urgency indicator */}
          <div className={`w-2 h-2 rounded-full ${urgencyColor}`} />
          
          {/* Category icon */}
          <span className="text-zinc-400">{categoryIcon}</span>
          
          {/* Incident type */}
          <span className="font-medium text-white capitalize">
            {incident.incident_type.replace(/_/g, ' ')}
          </span>
          
          {/* Verification badge */}
          {isVerified && (
            <span className="flex items-center gap-1 text-xs text-green-400" title="Verified">
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
          {isUnverified && (
            <span className="flex items-center gap-1 text-xs text-yellow-400" title="Unverified">
              <AlertCircle className="w-3 h-3" />
            </span>
          )}
        </div>
        
        {/* Time */}
        <span className="text-xs text-zinc-500 flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          {timeAgo(incident.occurred_at)}
        </span>
      </div>
      
      {/* Location */}
      {(incident.address || incident.city) && (
        <div className="flex items-center gap-1 text-sm text-zinc-400 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {incident.address && <span>{incident.address}</span>}
            {incident.address && incident.city && <span className="mx-1">•</span>}
            {incident.city && <span>{incident.city}</span>}
          </span>
          {incident.location_resolution && incident.location_resolution !== 'parcel' && (
            <span className="text-xs text-zinc-600 ml-1">
              ({incident.location_resolution})
            </span>
          )}
        </div>
      )}
      
      {/* Description */}
      <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
        {incident.description}
      </p>
      
      {/* Source Authority Badge */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        {incident.source_types.map((sourceType) => {
          const config = sourceConfig[sourceType] || { icon: null, label: sourceType, color: 'text-zinc-400' };
          return (
            <span 
              key={sourceType}
              className={`flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded text-xs ${config.color}`}
            >
              {config.icon}
              {config.label}
            </span>
          );
        })}
        
        {incident.report_count > 1 && (
          <span className="text-xs text-zinc-500">
            {incident.report_count} reports
          </span>
        )}
        
        {/* Confidence indicator */}
        <span className="ml-auto text-xs text-zinc-600">
          {Math.round(incident.confidence_score * 100)}%
        </span>
      </div>
    </div>
  );
}

export function IncidentFeed({ incidents, loading, selectedIncident, onSelect }: IncidentFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="h-4 w-24 bg-zinc-700 rounded" />
            </div>
            <div className="h-3 w-48 bg-zinc-800 rounded mb-2" />
            <div className="h-12 bg-zinc-800 rounded mb-3" />
            <div className="h-6 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <Shield className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">No incidents found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <IncidentCard 
          key={incident.id}
          incident={incident}
          isSelected={selectedIncident?.id === incident.id}
          onSelect={() => onSelect(selectedIncident?.id === incident.id ? null : incident)}
        />
      ))}
    </div>
  );
}
