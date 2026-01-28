// components/dashboard/map.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Incident } from '@/app/dashboard/page';

interface MapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelect: (incident: Incident) => void;
}

const DEFAULT_CENTER: [number, number] = [42.3239, -88.4506];
const DEFAULT_ZOOM = 10;

function getMarkerColor(urgency: number): string {
  if (urgency >= 7) return '#ef4444';
  if (urgency >= 4) return '#f97316';
  return '#3b82f6';
}

export function DashboardMap({ incidents, selectedIncident, onSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    let cancelled = false;
    
    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        if (!cancelled) {
          setLeaflet(L.default || L);
        }
      } catch (err) {
        console.error('Leaflet load error:', err);
      }
    };
    
    loadLeaflet();
    return () => { cancelled = true; };
  }, [isClient]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
    leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = leaflet.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    // Light mode tiles (CartoDB Positron)
    leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add zoom control to bottom right
    leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [leaflet]);

  // Update markers
  useEffect(() => {
    if (!leaflet || !mapInstanceRef.current || !mapReady) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    incidents.forEach((incident) => {
      if (!incident.latitude || !incident.longitude) return;

      const color = getMarkerColor(incident.urgency_score);
      const isSelected = selectedIncident?.id === incident.id;
      
      // Outer radar pulse circle (larger, low opacity)
      const outerMarker = leaflet.circleMarker(
        [incident.latitude, incident.longitude],
        {
          radius: isSelected ? 24 : 18,
          fillColor: color,
          color: 'transparent',
          weight: 0,
          fillOpacity: 0.15,
          className: 'radar-pulse',
        }
      );
      
      // Inner solid circle
      const innerMarker = leaflet.circleMarker(
        [incident.latitude, incident.longitude],
        {
          radius: isSelected ? 10 : 7,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }
      );

      // Click handler on inner marker
      innerMarker.on('click', () => {
        onSelect(incident);
      });
      
      outerMarker.on('click', () => {
        onSelect(incident);
      });

      outerMarker.addTo(map);
      innerMarker.addTo(map);
      markersRef.current.push(outerMarker, innerMarker);
    });

    // Fit bounds
    const valid = incidents.filter(i => i.latitude && i.longitude);
    if (valid.length > 0) {
      const bounds = leaflet.latLngBounds(valid.map(i => [i.latitude!, i.longitude!]));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
    }
  }, [leaflet, incidents, selectedIncident, onSelect, mapReady]);

  // Pan to selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedIncident?.latitude) return;
    mapInstanceRef.current.setView(
      [selectedIncident.latitude, selectedIncident.longitude],
      13,
      { animate: true }
    );
  }, [selectedIncident]);

  if (!isClient) {
    return <div className="w-full h-full bg-stone-200 dark:bg-zinc-900" />;
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
        crossOrigin="anonymous"
      />
      <style jsx global>{`
        .radar-pulse {
          animation: radar-pulse 2.5s ease-out infinite;
        }
        @keyframes radar-pulse {
          0% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.1); }
          100% { opacity: 0.25; transform: scale(1); }
        }
        .radar-glow-red {
          box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.3);
        }
        .radar-glow-orange {
          box-shadow: 0 0 20px 5px rgba(249, 115, 22, 0.3);
        }
        .radar-glow-blue {
          box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.3);
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .leaflet-control-zoom a {
          background: rgba(255,255,255,0.9) !important;
          backdrop-filter: blur(8px) !important;
          color: #44403c !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(255,255,255,1) !important;
        }
        .leaflet-control-zoom a:first-child {
          border-radius: 12px 12px 0 0 !important;
        }
        .leaflet-control-zoom a:last-child {
          border-radius: 0 0 12px 12px !important;
        }
        .dark .leaflet-control-zoom a {
          background: rgba(39, 39, 42, 0.9) !important;
          color: #a1a1aa !important;
        }
        .dark .leaflet-control-zoom a:hover {
          background: rgba(63, 63, 70, 1) !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.8) !important;
          backdrop-filter: blur(4px) !important;
          font-size: 10px !important;
          padding: 2px 8px !important;
          border-radius: 4px !important;
          margin: 8px !important;
        }
        .dark .leaflet-control-attribution {
          background: rgba(24,24,27,0.8) !important;
          color: #71717a !important;
        }
        .leaflet-control-attribution a {
          color: #f97316 !important;
        }
      `}</style>
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />
    </>
  );
}