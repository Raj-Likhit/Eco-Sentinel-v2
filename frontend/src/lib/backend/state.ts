import { ExternalStationData } from './services/dataSources';
import { MapData, PollutionAlert, IndustrialZone } from '@eco-sentinel/shared';

export type StationCache = {
  data: ExternalStationData[] | null;
  ts: number;
};

export type MapCache = {
  data: MapData | null;
  ts: number;
};

// Global state in serverless functions is not persistent across instances, 
// but can persist between hot requests on the same instance.
export const globalState = {
  stationCache: { data: null, ts: 0 } as StationCache,
  mapCache: { data: null, ts: 0 } as MapCache,
  alerts: [] as PollutionAlert[],
};

export const HYDERABAD_INDUSTRIAL_ZONES: IndustrialZone[] = [
  {
    id: 'zone-pashamylaram',
    name: 'IDA Pashamylaram Industrial Zone',
    location: { latitude: 17.53, longitude: 78.18 },
    boundingBox: { minLat: 17.505, maxLat: 17.555, minLng: 78.145, maxLng: 78.215 }
  },
  {
    id: 'zone-sanathnagar',
    name: 'Sanathnagar Industrial Belt',
    location: { latitude: 17.456, longitude: 78.444 },
    boundingBox: { minLat: 17.436, maxLat: 17.476, minLng: 78.424, maxLng: 78.464 }
  },
  {
    id: 'zone-cherlapally',
    name: 'Cherlapally Industrial Cluster',
    location: { latitude: 17.472, longitude: 78.583 },
    boundingBox: { minLat: 17.452, maxLat: 17.492, minLng: 78.563, maxLng: 78.603 }
  },
  {
    id: 'zone-patancheru',
    name: 'Patancheru Manufacturing Corridor',
    location: { latitude: 17.525, longitude: 78.265 },
    boundingBox: { minLat: 17.5, maxLat: 17.55, minLng: 78.235, maxLng: 78.295 }
  }
];

export const CACHE_TTL_MS = 30_000;
export const FORENSIC_THRESHOLD = 90;
export const ALERT_THRESHOLD = 0.75;
