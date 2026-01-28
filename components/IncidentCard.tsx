// components/IncidentCard.tsx
// Displays an incident with multi-source corroboration badges
// "Active Scene: 2 Police Reports, 1 Radio Dispatch, 1 News Snippet"

import React from 'react';
import { 
  AlertTriangle, 
  Radio, 
  Newspaper, 
  Shield, 
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SourceSummary {
  source_type: string;
  count: number;
}

interface Incident {
  id: string;
  incident_type: string;
  category: string;
  title?: string;
  description: string;
  address?: string;
  city?: string;
  occurred_at: string;
  urgency_score: number;
  confidence_score: number;
  review_status: string;
  report_count: number;
  source_types: string[];
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

// Source type icons and labels
const sourceConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  audio: { icon: <Radio className="w-3 h-3" />, label: 'Scanner' },
  html: { icon: <Newspaper className="w-3 h-3" />, label: 'News' },
  api: { icon: <Shield className="w-3 h-3" />, label: 'Official' },
  rss: { icon: <Newspaper className="w-3 h-3" />, label: 'News' },
};

// Format relative time
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function IncidentCard({ incident }: { incident: Incident }) {
  const urgencyColor = urgencyColors[incident.urgency_score] || 'bg-gray-400';
  const isVerified = incident.review_status === 'approved' || incident.review_status === 'auto_published';
  const isUnverified = incident.review_status === 'unverified';
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      {/* Header: Type + Urgency + Time */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Urgency indicator */}
          <div className={`w-2 h-2 rounded-full ${urgencyColor}`} />
          
          {/* Incident type */}
          <span className="font-medium text-white capitalize">
            {incident.incident_type.replace(/_/g, ' ')}
          </span>
          
          {/* Verification badge */}
          {isVerified && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          )}
          {isUnverified && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <AlertCircle className="w-3 h-3" />
              Unverified
            </span>
          )}
        </div>
        
        {/* Time */}
        <span className="text-xs text-zinc-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(incident.occurred_at)}
        </span>
      </div>
      
      {/* Location */}
      {(incident.address || incident.city) && (
        <div className="flex items-center gap-1 text-sm text-zinc-400 mb-2">
          <MapPin className="w-3 h-3" />
          {incident.address && <span>{incident.address}</span>}
          {incident.address && incident.city && <span>•</span>}
          {incident.city && <span>{incident.city}</span>}
        </div>
      )}
      
      {/* Description */}
      <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
        {incident.description}
      </p>
      
      {/* Source Authority Badge */}
      {/* This is the key differentiator: "2 Police Reports, 1 Scanner, 1 News" */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">Sources:</span>
        
        {incident.source_types.map((sourceType) => {
          const config = sourceConfig[sourceType] || { icon: null, label: sourceType };
          return (
            <span 
              key={sourceType}
              className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400"
            >
              {config.icon}
              {config.label}
            </span>
          );
        })}
        
        {incident.report_count > 1 && (
          <span className="text-xs text-zinc-500">
            ({incident.report_count} reports)
          </span>
        )}
        
        {/* Confidence indicator */}
        <span className="ml-auto text-xs text-zinc-600">
          {Math.round(incident.confidence_score * 100)}% confidence
        </span>
      </div>
    </div>
  );
}

// Example usage with multiple sources
export function ExampleIncidentCard() {
  const exampleIncident: Incident = {
    id: '1',
    incident_type: 'shooting',
    category: 'violent_crime',
    title: 'Shots Fired - Crystal Lake',
    description: 'Two men arrested following shots fired call in the 100 block of North Main Street. No injuries reported.',
    address: '100 block N Main St',
    city: 'Crystal Lake',
    occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    urgency_score: 8,
    confidence_score: 0.92,
    review_status: 'auto_published',
    report_count: 3,
    source_types: ['audio', 'html', 'api'],
  };
  
  return <IncidentCard incident={exampleIncident} />;
}
