'use client';

import { PlumePoint } from './types';

export const MAP_CENTER = { lat: 17.44, lng: 78.39 };
export const MAP_BOUNDS = { latSpan: 0.48, lngSpan: 0.62 };

export function latLngToXY(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - (MAP_CENTER.lng - MAP_BOUNDS.lngSpan / 2)) / MAP_BOUNDS.lngSpan) * w;
  const y = (1 - (lat - (MAP_CENTER.lat - MAP_BOUNDS.latSpan / 2)) / MAP_BOUNDS.latSpan) * h;
  return { x, y };
}

export function degToRadius(latDeg: number, h: number) {
  return (latDeg / MAP_BOUNDS.latSpan) * h;
}

export function severityColor(status: string) {
  if (status === 'CRITICAL') return '#ef4444';
  if (status === 'WARNING') return '#f59e0b';
  return '#10b981';
}

export function pm25Color(v: number) {
  if (v > 100) return '#ef4444';
  if (v > 55) return '#f59e0b';
  return '#10b981';
}

export function generatePlume(
  sourceLat: number,
  sourceLng: number,
  windDir: number,
  windSpeed: number,
  concentration: number
): PlumePoint[] {
  const points: PlumePoint[] = [];
  const windDirRad = (windDir * Math.PI) / 180;
  const downwindDx = Math.sin(windDirRad + Math.PI);
  const downwindDy = Math.cos(windDirRad + Math.PI);

  const stability = 0.12; // Pasquill D
  const kmPerDeg = 111.0;

  for (let x = 0.2; x <= 18; x += 0.4) {
    const sigmaY = stability * x * Math.pow(1 + 0.0002 * x, -0.5);
    const sigmaZ = 0.08 * x * Math.pow(1 + 0.0015 * x, -0.5);
    const maxConc = concentration / (Math.PI * windSpeed * sigmaY * sigmaZ);

    for (let y = -sigmaY * 3.5; y <= sigmaY * 3.5; y += sigmaY * 0.3) {
      const intensity =
        Math.exp(-0.5 * (y / sigmaY) ** 2) *
        (maxConc / (concentration / (Math.PI * windSpeed * 0.1 * 0.1)));
      if (intensity < 0.04) continue;

      const perpDx = -downwindDy;
      const perpDy = downwindDx;
      const lat = sourceLat + (downwindDy * x + perpDy * y) / kmPerDeg;
      const lng =
        sourceLng +
        (downwindDx * x + perpDx * y) / (kmPerDeg * Math.cos((sourceLat * Math.PI) / 180));
      points.push({ lat, lng, intensity: Math.min(intensity, 1) });
    }
  }
  return points;
}
