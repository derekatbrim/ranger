'use client';

import { useEffect, useRef, useState } from 'react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelect: (incident: Incident | null) => void;
}

// McHenry County center
const DEFAULT_CENTER: [number, number] = [42.3239, -88.4506];
const DEFAULT_ZOOM = 10;

// Urgency to marker color
function getMarkerColor(urgency: number): string {
  if (urgency >= 8) return '#ef4444'; // red
  if (urgency >= 6) return '#f97316'; // orange
  if (urgency >= 4) return '#eab308'; // yellow
  return '#3b82f6'; // blue
}

export function IncidentMap({ incidents, selectedIncident, onSelect }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [leaflet, setLeaflet] = useState<any>(null);

  // Dynamic import Leaflet (client-side only)
  useEffect(() => {
    import('leaflet').then((L) => {
      setLeaflet(L.default);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    // Fix Leaflet default icon issue
    delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
    leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = leaflet.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark tile layer (CartoDB Dark Matter - free)
    leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leaflet]);

  // Update markers when incidents change
  useEffect(() => {
    if (!leaflet || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    incidents.forEach((incident) => {
      if (!incident.latitude || !incident.longitude) return;

      const color = getMarkerColor(incident.urgency_score);
      const isSelected = selectedIncident?.id === incident.id;
      
      // Create custom circle marker
      const marker = leaflet.circleMarker(
        [incident.latitude, incident.longitude],
        {
          radius: isSelected ? 12 : 8,
          fillColor: color,
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: 0.7,
        }
      );

      // Popup content
      const popupContent = `
        <div style="min-width: 200px; color: #fff;">
          <div style="font-weight: 600; margin-bottom: 4px; color: ${color};">
            ${incident.incident_type.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 8px;">
            ${incident.address || incident.city || 'Unknown location'}
          </div>
          <div style="font-size: 13px; color: #d4d4d8;">
            ${incident.description.slice(0, 150)}${incident.description.length > 150 ? '...' : ''}
          </div>
          <div style="font-size: 11px; color: #71717a; margin-top: 8px;">
            ${new Date(incident.occurred_at).toLocaleString()}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'dark-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        onSelect(incident);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds if we have incidents
    if (incidents.length > 0) {
      const validIncidents = incidents.filter(i => i.latitude && i.longitude);
      if (validIncidents.length > 0) {
        const bounds = leaflet.latLngBounds(
          validIncidents.map(i => [i.latitude!, i.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [leaflet, incidents, selectedIncident, onSelect]);

  // Center on selected incident
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedIncident?.latitude || !selectedIncident?.longitude) return;
    
    mapInstanceRef.current.setView(
      [selectedIncident.latitude, selectedIncident.longitude],
      14,
      { animate: true }
    );
  }, [selectedIncident]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
        integrity="sha512-Zcn6bjR/8RZbLEpLIeOwNtzREBAJnUKESxces60Mpoj+2okopSAcSUIUOseddDm0cxnGQzxIR7vJgsLZbdLE3w=="
        crossOrigin="anonymous"
      />
      
      {/* Custom popup styles */}
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #18181b;
          border: 1px solid #3f3f46;
          border-radius: 8px;
        }
        .dark-popup .leaflet-popup-tip {
          background: #18181b;
          border: 1px solid #3f3f46;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #a1a1aa !important;
        }
        .leaflet-control-zoom a {
          background: #27272a !important;
          color: #fff !important;
          border-color: #3f3f46 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #3f3f46 !important;
        }
        .leaflet-control-attribution {
          background: rgba(24, 24, 27, 0.8) !important;
          color: #71717a !important;
        }
        .leaflet-control-attribution a {
          color: #a1a1aa !important;
        }
      `}</style>

      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden border border-zinc-800"
        style={{ background: '#18181b' }}
      />
    </>
  );
}
