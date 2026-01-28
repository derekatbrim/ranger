'use client';

import { Filter, X } from 'lucide-react';
import type { Filters } from '@/app/dashboard/page';

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  cities: string[];
}

const CATEGORIES = [
  { value: 'violent_crime', label: 'Violent Crime' },
  { value: 'property_crime', label: 'Property Crime' },
  { value: 'fire', label: 'Fire' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'drugs', label: 'Drugs' },
  { value: 'missing_person', label: 'Missing Person' },
  { value: 'suspicious', label: 'Suspicious' },
  { value: 'other', label: 'Other' },
];

const TIME_RANGES = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
];

export function FilterBar({ filters, setFilters, cities }: FilterBarProps) {
  const hasActiveFilters = filters.category || filters.city || filters.minUrgency > 1 || filters.timeRange !== '7d';

  const clearFilters = () => {
    setFilters({
      category: null,
      timeRange: '7d',
      city: null,
      minUrgency: 1,
    });
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter icon */}
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Filters</span>
          </div>

          {/* Time range */}
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as Filters['timeRange'] })}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {TIME_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || null })}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* City */}
          <select
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value || null })}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Urgency slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Min Urgency:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.minUrgency}
              onChange={(e) => setFilters({ ...filters, minUrgency: parseInt(e.target.value) })}
              className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-xs text-zinc-400 w-4">{filters.minUrgency}</span>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
