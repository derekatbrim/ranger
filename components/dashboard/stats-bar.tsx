'use client';

import { AlertTriangle, Flame, Car, TrendingUp } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface StatsBarProps {
  incidents: Incident[];
}

export function StatsBar({ incidents }: StatsBarProps) {
  // Calculate stats
  const totalIncidents = incidents.length;
  const violentCrimes = incidents.filter(i => i.category === 'violent_crime').length;
  const fires = incidents.filter(i => i.category === 'fire').length;
  const traffic = incidents.filter(i => i.category === 'traffic').length;
  
  // High urgency (7+)
  const highUrgency = incidents.filter(i => i.urgency_score >= 7).length;
  
  // Last 24 hours
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = incidents.filter(i => new Date(i.occurred_at).getTime() > oneDayAgo).length;

  const stats = [
    { 
      label: 'Total', 
      value: totalIncidents, 
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-zinc-300',
      bgColor: 'bg-zinc-800'
    },
    { 
      label: 'Last 24h', 
      value: last24h, 
      icon: null,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    { 
      label: 'High Priority', 
      value: highUrgency, 
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    { 
      label: 'Violent', 
      value: violentCrimes, 
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    { 
      label: 'Fires', 
      value: fires, 
      icon: <Flame className="w-4 h-4" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    { 
      label: 'Traffic', 
      value: traffic, 
      icon: <Car className="w-4 h-4" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
  ];

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${stat.bgColor} flex-shrink-0`}
            >
              {stat.icon && <span className={stat.color}>{stat.icon}</span>}
              <span className={`text-lg font-semibold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-xs text-zinc-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
