import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import {
  CreateAlertRequest,
  IndustrialZone,
  MapData,
  PollutionAlert,
  PollutionData,
  PollutionSource,
  WindVector
} from '@eco-sentinel/shared';
import { DataSourceService, ExternalStationData } from './services/dataSources';
import { ForensicService } from './services/forensics';
import { PlumeService } from './services/plume';
import { calculateDistance } from './utils/geo';
import alertsRouter from './routes/alerts';

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_TTL_MS = 30_000;
const FORENSIC_THRESHOLD = 90;
const ALERT_THRESHOLD = 0.75;

app.use(cors());
app.use(express.json());

// Email alert routes
app.use('/api/email-alerts', alertsRouter);

const HYDERABAD_INDUSTRIAL_ZONES: IndustrialZone[] = [
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

type StationCache = {
  data: ExternalStationData[] | null;
  ts: number;
};

type MapCache = {
  data: MapData | null;
  ts: number;
};

const stationCache: StationCache = {
  data: null,
  ts: 0
};

const mapCache: MapCache = {
  data: null,
  ts: 0
};

let alerts: PollutionAlert[] = [];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function stationToPollutionData(station: ExternalStationData): PollutionData {
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

function findNearestIndustrialZone(pollutionData: PollutionData): IndustrialZone {
  return HYDERABAD_INDUSTRIAL_ZONES.reduce((nearest, candidate) => {
    const candidateDistance = calculateDistance(pollutionData.location, candidate.location);
    const nearestDistance = calculateDistance(pollutionData.location, nearest.location);
    return candidateDistance < nearestDistance ? candidate : nearest;
  }, HYDERABAD_INDUSTRIAL_ZONES[0]);
}

function buildWindVector(pollutionData: PollutionData): WindVector {
  return {
    speed: pollutionData.concentration > 100 ? 7.5 : 5.2,
    direction: 315,
    timestamp: pollutionData.timestamp
  };
}

function buildAlert(source: PollutionSource, pollutionData: PollutionData): PollutionAlert {
  return {
    id: `alert-${pollutionData.id}`,
    pollutionData,
    identifiedSource: source,
    aiExplanation: `Evidence suggests ${source.zone.name} is the most likely upwind contributor with ${(source.confidence * 100).toFixed(0)}% confidence.`,
    timestamp: new Date(),
    status: 'investigating',
    markers: [
      source.evidence?.windTrajectoryMatch ? 'WIND_MATCHED' : 'WIND_INCONCLUSIVE',
      source.evidence?.satelliteSpectralMatch ? 'SATELLITE_VERIFIED' : 'SATELLITE_UNAVAILABLE'
    ]
  };
}

function mergeAlerts(generatedAlerts: PollutionAlert[]): PollutionAlert[] {
  const merged = new Map<string, PollutionAlert>();

  for (const existingAlert of alerts) {
    merged.set(existingAlert.id, existingAlert);
  }

  for (const alert of generatedAlerts) {
    merged.set(alert.id, alert);
  }

  alerts = Array.from(merged.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 25);

  return alerts;
}

function scoreStationMatch(stationName: string, query: string): number {
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

async function getStations(): Promise<ExternalStationData[]> {
  if (stationCache.data && Date.now() - stationCache.ts < CACHE_TTL_MS) {
    return stationCache.data;
  }

  const stations = await DataSourceService.fetchAllSources();
  stationCache.data = stations;
  stationCache.ts = Date.now();
  return stations;
}

async function analyzeStation(station: ExternalStationData): Promise<{
  pollutionData: PollutionData;
  source: PollutionSource;
  plume: { lat: number; lng: number; intensity: number }[];
  windVector: WindVector;
}> {
  const pollutionData = stationToPollutionData(station);
  const nearestZone = findNearestIndustrialZone(pollutionData);
  const evidence = await ForensicService.analyzeChainOfEvidence(pollutionData, nearestZone);
  const windVector = buildWindVector(pollutionData);
  const plume = PlumeService.calculatePlume(
    { lat: pollutionData.location.latitude, lng: pollutionData.location.longitude },
    pollutionData.concentration,
    windVector.speed,
    windVector.direction
  );

  return {
    pollutionData,
    windVector,
    plume,
    source: {
      zone: nearestZone,
      confidence: evidence.confidenceScore,
      analysisTimestamp: new Date(),
      evidence
    }
  };
}

async function buildMapData(): Promise<MapData> {
  if (mapCache.data && Date.now() - mapCache.ts < CACHE_TTL_MS) {
    return mapCache.data;
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

  const mapData: MapData = {
    pollutionPoints,
    windVectors,
    industrialZones: HYDERABAD_INDUSTRIAL_ZONES,
    identifiedSources,
    activeAlerts,
    predictions
  };

  mapCache.data = mapData;
  mapCache.ts = Date.now();

  return mapData;
}

app.get('/api/pollution/latest', async (_req, res) => {
  try {
    const stations = await getStations();
    res.json({
      success: true,
      data: stations.map(stationToPollutionData)
    });
  } catch (error) {
    console.error('[server] Failed to fetch latest pollution data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pollution data' });
  }
});

app.get('/api/map/data', async (_req, res) => {
  try {
    const mapData = await buildMapData();
    res.json({
      success: true,
      data: mapData
    });
  } catch (error) {
    console.error('[server] Failed to assemble map data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch map data' });
  }
});

app.get('/api/alerts', (_req, res) => {
  res.json({
    success: true,
    data: alerts
  });
});

app.post('/api/alerts', (req, res) => {
  const requestData = req.body as CreateAlertRequest;
  const newAlert: PollutionAlert = {
    id: `manual-${Date.now()}`,
    pollutionData: requestData.pollutionData,
    identifiedSource: requestData.identifiedSource,
    aiExplanation: requestData.aiExplanation,
    timestamp: new Date(),
    status: 'investigating'
  };

  alerts = [newAlert, ...alerts].slice(0, 25);

  res.status(201).json({
    success: true,
    data: newAlert
  });
});

app.post('/api/identify-source', async (req, res) => {
  try {
    const pollutionData = req.body?.pollutionData as PollutionData | undefined;

    if (!pollutionData) {
      return res.status(400).json({ success: false, error: 'pollutionData is required' });
    }

    const nearestZone = findNearestIndustrialZone(pollutionData);
    const evidence = await ForensicService.analyzeChainOfEvidence(pollutionData, nearestZone);

    const source: PollutionSource = {
      zone: nearestZone,
      confidence: evidence.confidenceScore,
      analysisTimestamp: new Date(),
      evidence
    };

    if (source.confidence >= ALERT_THRESHOLD) {
      mergeAlerts([buildAlert(source, pollutionData)]);
    }

    res.json({
      success: true,
      data: source,
      explanation: `Based on wind trajectory and spectral evidence, ${nearestZone.name} is the most likely source.`
    });
  } catch (error) {
    console.error('[server] Failed to identify source:', error);
    res.status(500).json({ success: false, error: 'Failed to identify pollution source' });
  }
});

app.get('/api/live', async (req, res) => {
  try {
    const zone = String(req.query.zone || '').trim();

    if (!zone) {
      return res.status(400).json({ success: false, error: 'Zone parameter required' });
    }

    const stations = await getStations();
    const rankedStations = stations
      .map((station) => ({
        station,
        score: scoreStationMatch(station.stationName, zone)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const fallbackStations = rankedStations.length > 0
      ? rankedStations.map((entry) => entry.station)
      : [...stations].sort((a, b) => {
          const aDistance = calculateDistance(
            { latitude: a.location.latitude, longitude: a.location.longitude },
            HYDERABAD_INDUSTRIAL_ZONES[0].location
          );
          const bDistance = calculateDistance(
            { latitude: b.location.latitude, longitude: b.location.longitude },
            HYDERABAD_INDUSTRIAL_ZONES[0].location
          );
          return aDistance - bDistance;
        });

    const selectedStations = fallbackStations.slice(0, 5);
    const matchedZone = rankedStations.length > 0 ? rankedStations[0].station.stationName : selectedStations[0]?.stationName || zone;
    const avgPollution = selectedStations.length > 0
      ? Math.round(selectedStations.reduce((sum, station) => sum + station.concentration, 0) / selectedStations.length)
      : 0;

    res.json({
      success: true,
      data: {
        zone,
        matchedZone,
        stations: selectedStations.map((station) => ({
          id: station.id,
          name: station.stationName,
          lat: station.location.latitude,
          lng: station.location.longitude,
          pm25: station.concentration,
          source: station.source
        })),
        weather: {
          temperature: 28,
          humidity: 65,
          windSpeed: avgPollution > 100 ? 14 : 10,
          windDirection: 310,
          condition: avgPollution > 100 ? 'Haze Detected' : 'Partly Cloudy'
        },
        avgPollution
      }
    });
  } catch (error) {
    console.error('[server] Failed to fetch live location data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch location data' });
  }
});

app.listen(PORT, () => {
  console.log(`Eco-Sentinel backend running on port ${PORT}`);
});
