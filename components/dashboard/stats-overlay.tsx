// components/dashboard/stats-overlay.tsx
'use client';

import { AlertTriangle, Flame, Clock, TrendingUp, Shield, MapPin } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface StatsOverlayProps {
  incidents: Incident[];
}

export function StatsOverlay({ incidents }: StatsOverlayProps) {
  const total = incidents.length;
  const highPriority = incidents.filter(i => i.urgency_score >= 7).length;
  const last24h = incidents.filter(i => {
    const time = new Date(i.occurred_at).getTime();
    return Date.now() - time < 24 * 60 * 60 * 1000;
  }).length;

  // Most common category
  const categories = incidents.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  // Get unique source types count
  const sourceTypes = new Set(incidents.flatMap(i => i.source_types)).size;

  return (
    <>
      {/* Top stats bar - glass pill */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-xl shadow-black/5 border border-stone-200/50 dark:border-zinc-800/50">
          <StatPill 
            icon={<Shield className="w-3 h-3" />}
            value={total} 
            label="Active" 
          />
          <div className="w-px h-6 bg-stone-200 dark:bg-zinc-800" />
          <StatPill 
            icon={<Clock className="w-3 h-3" />}
            value={last24h} 
            label="24h" 
          />
          <div className="w-px h-6 bg-stone-200 dark:bg-zinc-800" />
          <StatPill 
            icon={<AlertTriangle className="w-3 h-3" />}
            value={highPriority} 
            label="High" 
            highlighted={highPriority > 0}
          />
        </div>
      </div>

      {/* Bottom left location card */}
      <div className="absolute bottom-6 left-6 z-30">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-black/5 border border-stone-200/50 dark:border-zinc-800/50 w-72">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <h3 className="font-display text-lg tracking-tight">McHenry County</h3>
              </div>
              <p className="font-mono text-[11px] text-stone-500">
                Illinois · 15 municipalities
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Live</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={<Clock className="w-4 h-4" />} label="Last 24h" value={last24h} />
            <StatBox icon={<AlertTriangle className="w-4 h-4" />} label="High" value={highPriority} accent={highPriority > 0} />
            <StatBox icon={<TrendingUp className="w-4 h-4" />} label="Sources" value={sourceTypes} />
          </div>
        </div>
      </div>

      {/* Bottom right summary card */}
      <div className="absolute bottom-6 right-6 z-30">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-black/5 border border-stone-200/50 dark:border-zinc-800/50 w-64">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="font-display text-2xl text-white">{total}</span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">This Week</p>
              <p className="font-display text-xl tracking-tight">Incidents</p>
            </div>
          </div>
          
          {topCategory && (
            <div className="pt-3 border-t border-stone-200/50 dark:border-zinc-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                    Most Common
                  </p>
                  <p className="font-mono text-sm text-stone-600 dark:text-stone-300 capitalize">
                    {topCategory[0].replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl tracking-tight text-orange-500">{topCategory[1]}</span>
                  <p className="font-mono text-[10px] text-stone-400">incidents</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatPill({ 
  icon,
  value, 
  label, 
  highlighted = false 
}: { 
  icon: React.ReactNode;
  value: string | number; 
  label: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${highlighted ? 'bg-orange-500/10' : ''}`}>
      <span className={highlighted ? 'text-orange-500' : 'text-stone-400'}>{icon}</span>
      <span className={`font-display text-lg ${highlighted ? 'text-orange-500' : 'text-stone-900 dark:text-white'}`}>
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </span>
    </div>
  );
}

function StatBox({ 
  icon, 
  label, 
  value,
  accent = false
}: { 
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`text-center p-2 rounded-xl ${accent ? 'bg-orange-500/10' : 'bg-stone-100/50 dark:bg-zinc-800/50'}`}>
      <div className={`flex justify-center mb-1 ${accent ? 'text-orange-500' : 'text-stone-400'}`}>
        {icon}
      </div>
      <p className={`font-display text-xl tracking-tight ${accent ? 'text-orange-500' : ''}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400">{label}</p>
    </div>
  );
}