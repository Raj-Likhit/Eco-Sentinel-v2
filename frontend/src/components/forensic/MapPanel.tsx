'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station, IndustrialZone, WindData } from './types';
import { severityColor } from './utils';
import { useTheme } from '../../context/ThemeContext';

interface MapPanelProps {
  stations: Station[];
  industrialZones: IndustrialZone[];
  wind: WindData;
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
}

export default function MapPanel({
  stations,
  industrialZones,
  wind,
  selectedStation,
  onSelectStation,
}: MapPanelProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centered on Hyderabad
    const map = L.map(containerRef.current, {
      center: [17.44, 78.39],
      zoom: 11,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add initial tile layer based on theme
    const tileUrl = theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const map = mapRef.current;
    
    // Remove old tile layer
    map.removeLayer(tileLayerRef.current);

    // Add new tile layer based on theme
    const tileUrl = theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);
  }, [theme]);

  // Update markers when stations or selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add industrial zones
    industrialZones.forEach((zone) => {
      L.circle([zone.lat, zone.lng], {
        radius: zone.radiusKm * 1000,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.04,
        weight: 1,
        dashArray: '5, 4',
      })
        .addTo(map)
        .bindPopup(`<strong>${zone.name}</strong><br/>Industrial Zone`);
    });

    // Add station markers
    stations.forEach((st) => {
      const col = severityColor(st.status);
      const isSelected = selectedStation?.id === st.id;
      const isCritical = st.status === 'CRITICAL';

      // Create custom icon
      const iconHtml = `
        <div style="position: relative;">
          ${
            isCritical
              ? `<div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 1px solid #ef4444; opacity: 0.3; animation: pulse 2s infinite; left: -9px; top: -9px;"></div>`
              : ''
          }
          <div style="
            width: ${isSelected ? 14 : 10}px;
            height: ${isSelected ? 14 : 10}px;
            background: ${col};
            border: ${isSelected ? '2px solid white' : 'none'};
            border-radius: 50%;
            box-shadow: 0 0 ${isCritical ? 16 : 8}px ${col};
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([st.lat, st.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: 'DM Mono', monospace; font-size: 11px;">
            <strong>${st.name}</strong><br/>
            PM2.5: ${st.pm25.toFixed(1)} µg/m³<br/>
            Status: <span style="color: ${col}">${st.status}</span><br/>
            Z-Score: ${st.zscore.toFixed(2)}σ<br/>
            Source: ${st.source}
          </div>`
        );

      marker.on('click', () => {
        onSelectStation(st);
      });
    });
  }, [stations, industrialZones, selectedStation, onSelectStation]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Wind indicator overlay */}
      <div className="absolute top-3 left-3 p-1.5 z-[1000]" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', backdropFilter: 'blur(8px)' }}>
        <div className="font-data text-[9px] tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>WIND VECTOR</div>
        <div className="font-data text-[13px] text-emerald-500 mt-0.5">
          {wind.direction}° NW · {wind.speed} m/s
        </div>
        <div className="font-data text-[9px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          GUST {wind.gust} m/s · PASQUILL-D
        </div>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-3 right-3 p-2 flex flex-col gap-1 z-[1000]" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', backdropFilter: 'blur(8px)' }}>
        {[
          ['INDUSTRIAL ZONE', '#ef4444', 'dashed'],
          ['CRITICAL STATION', '#ef4444', 'circle'],
          ['WARNING STATION', '#f59e0b', 'circle'],
          ['NORMAL STATION', '#10b981', 'circle'],
        ].map(([label, color, type]) => (
          <div key={label as string} className="flex items-center gap-1.5">
            {type === 'circle' ? (
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color as string }} />
            ) : (
              <div
                className="w-4 h-px shrink-0"
                style={{
                  background: 'transparent',
                  borderBottom: `1px dashed ${color}`,
                }}
              />
            )}
            <div className="font-data text-[8px] tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
