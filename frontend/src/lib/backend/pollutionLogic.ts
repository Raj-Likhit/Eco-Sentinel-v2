import { ExternalStationData, DataSourceService } from './services/dataSources';
import { PollutionData, PollutionSource, WindVector, PollutionAlert } from '@eco-sentinel/shared';
import { ForensicService } from './services/forensics';
import { PlumeService } from './services/plume';
import { calculateDistance } from './utils/geo';
import { globalState, HYDERABAD_INDUSTRIAL_ZONES, CACHE_TTL_MS, FORENSIC_THRESHOLD, ALERT_THRESHOLD } from './state';

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function stationToPollutionData(station: ExternalStationData): PollutionData {
  return {
    id: station.id,
    timestamp: station.timestamp,
    location: {
      latitude: station.location.latitude,
      longitude: station.location.longitude
    },
    pollutant: station.pollutant,
    concentration: station.concentration,
    unit: station.unit,
    source: station.source
  };
}

export function findNearestIndustrialZone(pollutionData: PollutionData) {
  const location = typeof pollutionData.location === 'object' ? pollutionData.location : { latitude: 17.3850, longitude: 78.4867 };
  return HYDERABAD_INDUSTRIAL_ZONES.reduce((nearest, candidate) => {
    const candidateLocation = candidate.location || { latitude: 17.3850, longitude: 78.4867 };
    const nearestLocation = nearest.location || { latitude: 17.3850, longitude: 78.4867 };
    const candidateDistance = calculateDistance(location, candidateLocation);
    const nearestDistance = calculateDistance(location, nearestLocation);
    return candidateDistance < nearestDistance ? candidate : nearest;
  }, HYDERABAD_INDUSTRIAL_ZONES[0]);
}

export function buildWindVector(pollutionData: PollutionData): WindVector {
  return {
    speed: (pollutionData.concentration || 0) > 100 ? 7.5 : 5.2,
    direction: 315,
    timestamp: typeof pollutionData.timestamp === 'string' ? pollutionData.timestamp : new Date().toISOString()
  };
}

export function buildAlert(source: PollutionSource, pollutionData: PollutionData): PollutionAlert {
  const zoneName = source.zone?.name || source.name || 'Unknown Source';
  return {
    id: `alert-${pollutionData.id}`,
    pollutionData,
    identifiedSource: source,
    aiExplanation: `Evidence suggests ${zoneName} is the most likely upwind contributor with ${(source.confidence * 100).toFixed(0)}% confidence.`,
    timestamp: new Date(),
    status: 'investigating'
  };
}

export function mergeAlerts(generatedAlerts: PollutionAlert[]): PollutionAlert[] {
  const merged = new Map<string, PollutionAlert>();

  for (const existingAlert of globalState.alerts) {
    merged.set(existingAlert.id, existingAlert);
  }

  for (const alert of generatedAlerts) {
    merged.set(alert.id, alert);
  }

  globalState.alerts = Array.from(merged.values())
    .sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 25);

  return globalState.alerts;
}

export function scoreStationMatch(stationName: string, query: string): number {
  const normalizedStation = normalizeText(stationName);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return 0;
  if (normalizedStation === normalizedQuery) return 100;
  if (normalizedStation.startsWith(normalizedQuery)) return 80;
  if (normalizedStation.includes(normalizedQuery)) return 70;

  const stationTokens = new Set(normalizedStation.split(' '));
  const queryTokens = normalizedQuery.split(' ');
  const tokenMatches = queryTokens.filter((token) => stationTokens.has(token)).length;

  if (tokenMatches > 0) {
    return tokenMatches * 20;
  }

  return 0;
}

export async function getStations(): Promise<ExternalStationData[]> {
  if (globalState.stationCache.data && Date.now() - globalState.stationCache.ts < CACHE_TTL_MS) {
    return globalState.stationCache.data;
  }

  const stations = await DataSourceService.fetchAllSources();
  globalState.stationCache.data = stations;
  globalState.stationCache.ts = Date.now();
  return stations;
}

export async function analyzeStation(station: ExternalStationData) {
  const pollutionData = stationToPollutionData(station);
  const nearestZone = findNearestIndustrialZone(pollutionData);
  const evidence = await ForensicService.analyzeChainOfEvidence(pollutionData, nearestZone);
  const windVector = buildWindVector(pollutionData);
  const location = typeof pollutionData.location === 'object' ? pollutionData.location : { latitude: 17.3850, longitude: 78.4867 };
  const plume = PlumeService.calculatePlume(
    { lat: location.latitude, lng: location.longitude },
    pollutionData.concentration || 0,
    windVector.speed,
    windVector.direction
  );

  return {
    pollutionData,
    windVector,
    plume,
    source: {
      zone: nearestZone,
      confidence: evidence.confidence || 0,
      analysisTimestamp: new Date(),
      evidence
    }
  };
}

export async function buildMapData() {
  if (globalState.mapCache.data && Date.now() - globalState.mapCache.ts < CACHE_TTL_MS) {
    return globalState.mapCache.data;
  }

  const stations = await getStations();
  const pollutionPoints = stations.map(stationToPollutionData);
  const spikedStations = stations.filter((station) => station.concentration >= FORENSIC_THRESHOLD);
  const forensicResults = await Promise.all(spikedStations.map(analyzeStation));
  const identifiedSources = forensicResults.map((result) => result.source);
  const predictions = forensicResults.flatMap((result) => result.plume);
  const windVectors = forensicResults.map((result) => result.windVector);
  const generatedAlerts = forensicResults
    .filter((result) => result.source.confidence >= ALERT_THRESHOLD)
    .map((result) => buildAlert(result.source, result.pollutionData));

  const activeAlerts = mergeAlerts(generatedAlerts);

  const mapData = {
    pollutionPoints,
    windVectors,
    industrialZones: HYDERABAD_INDUSTRIAL_ZONES,
    identifiedSources,
    activeAlerts,
    predictions
  };

  globalState.mapCache.data = mapData as any;
  globalState.mapCache.ts = Date.now();

  return mapData;
}
