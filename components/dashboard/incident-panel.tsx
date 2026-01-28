// components/dashboard/incident-panel.tsx
'use client';

import { X, MapPin, Clock, Shield, Radio, Newspaper, CheckCircle, AlertCircle, ExternalLink, Share2 } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentPanelProps {
  incident: Incident | null;
  open: boolean;
  onClose: () => void;
}

export function IncidentPanel({ incident, open, onClose }: IncidentPanelProps) {
  if (!incident) return null;

  const sourceIcons: Record<string, React.ReactNode> = {
    api: <Shield className="w-4 h-4" />,
    audio: <Radio className="w-4 h-4" />,
    html: <Newspaper className="w-4 h-4" />,
  };

  const sourceLabels: Record<string, string> = {
    api: 'Official Source',
    audio: 'Police Scanner',
    html: 'News Report',
  };

  const urgencyColor = incident.urgency_score >= 7 
    ? 'from-red-500 to-red-600' 
    : incident.urgency_score >= 4 
      ? 'from-orange-500 to-orange-600' 
      : 'from-blue-500 to-blue-600';

  const urgencyBg = incident.urgency_score >= 7 
    ? 'bg-red-500/10' 
    : incident.urgency_score >= 4 
      ? 'bg-orange-500/10' 
      : 'bg-blue-500/10';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`
          fixed top-0 right-0 bottom-0 w-full max-w-md z-50 
          bg-white dark:bg-zinc-900 
          shadow-2xl shadow-black/10
          transform transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header with gradient */}
        <div className={`relative h-40 bg-gradient-to-br ${urgencyColor} flex-shrink-0`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Share button */}
          <button 
            className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Urgency score badge */}
          <div className="absolute top-4 left-6">
            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="font-display text-2xl text-white">{incident.urgency_score}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/80">/10 Urgency</span>
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute bottom-4 left-6">
            <span className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-full font-mono text-[10px] uppercase tracking-wider text-stone-600 dark:text-stone-300 shadow-lg">
              {incident.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Title */}
          <h2 className="font-display text-3xl tracking-tight mb-3">
            {incident.incident_type.replace(/_/g, ' ').toUpperCase()}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {(incident.address || incident.city) && (
              <div className="flex items-center gap-1.5 text-stone-500">
                <MapPin className="w-4 h-4" />
                <span className="font-mono text-xs">
                  {incident.address ? `${incident.address}, ${incident.city}` : incident.city}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-stone-500">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-xs">
                {formatTime(incident.occurred_at)}
              </span>
            </div>
          </div>

          {/* Verification status */}
          <div className={`
            inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6
            ${incident.review_status === 'verified' || incident.review_status === 'auto_published'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            }
          `}>
            {incident.review_status === 'verified' || incident.review_status === 'auto_published'
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            <span className="font-mono text-xs uppercase tracking-wider">
              {incident.review_status === 'verified' || incident.review_status === 'auto_published' ? 'Verified' : 'Unverified'}
            </span>
            <span className="w-px h-4 bg-current opacity-30" />
            <span className="font-mono text-xs">
              {Math.round(incident.confidence_score * 100)}% confidence
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
              Description
            </h3>
            <p className="font-mono text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Sources */}
          <div className="mb-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
              Sources · {incident.report_count} {incident.report_count === 1 ? 'report' : 'reports'}
            </h3>
            <div className="space-y-2">
              {incident.source_types.map((type) => (
                <div 
                  key={type}
                  className="flex items-center justify-between p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-stone-500">
                      {sourceIcons[type]}
                    </div>
                    <div>
                      <span className="font-mono text-sm text-stone-600 dark:text-stone-300 block">
                        {sourceLabels[type] || type}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">
                        {type === 'api' ? 'Law enforcement data' : type === 'audio' ? 'Real-time dispatch' : 'Local media'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard 
              label="Urgency" 
              value={`${incident.urgency_score}/10`} 
              accent={incident.urgency_score >= 7}
            />
            <StatCard label="Reports" value={incident.report_count.toString()} />
            <StatCard label="Sources" value={incident.source_types.length.toString()} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900">
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-colors">
              View on Map
            </button>
            <button className="px-4 py-3 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider rounded-xl transition-colors">
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${accent ? 'bg-orange-500/10' : 'bg-stone-50 dark:bg-zinc-800/50'}`}>
      <p className={`font-display text-2xl tracking-tight ${accent ? 'text-orange-500' : ''}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400 mt-1">{label}</p>
    </div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}