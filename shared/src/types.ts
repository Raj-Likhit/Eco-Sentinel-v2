// Shared types between frontend and backend

export interface PollutionData {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  pollutant: string;
  concentration: number;
  unit: string;
  source?: string;
}

export interface IndustrialZone {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface WindVector {
  speed: number; // m/s
  direction: number; // degrees
  timestamp: Date;
}

export interface ForensicEvidence {
  windTrajectoryMatch: boolean;
  satelliteSpectralMatch: boolean;
  trajectoryPath?: { latitude: number; longitude: number }[];
  confidenceScore: number;
  satelliteTileUrl?: string;
}

export interface PollutionSource {
  zone: IndustrialZone;
  confidence: number; // 0-1
  analysisTimestamp: Date;
  evidence?: ForensicEvidence;
}

export interface PollutionAlert {
  id: string;
  pollutionData: PollutionData;
  identifiedSource: PollutionSource | null;
  aiExplanation: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'investigating';
  markers?: string[]; // e.g., ['SATELLITE_VERIFIED', 'WIND_MATCHED']
}

export interface MapData {
  pollutionPoints: PollutionData[];
  windVectors: WindVector[];
  industrialZones: IndustrialZone[];
  identifiedSources: PollutionSource[];
  activeAlerts?: PollutionAlert[];
  predictions?: { lat: number; lng: number; intensity: number }[];
}

// API Response Types
export interface GetLatestPollutionResponse {
  success: boolean;
  data?: PollutionData[];
  error?: string;
}

export interface GetMapDataResponse {
  success: boolean;
  data?: MapData;
  error?: string;
}

export interface IdentifySourceRequest {
  pollutionData: PollutionData;
  windData: WindVector[];
}

export interface IdentifySourceResponse {
  success: boolean;
  data?: PollutionSource;
  explanation?: string;
  error?: string;
}

export interface CreateAlertRequest {
  pollutionData: PollutionData;
  identifiedSource: PollutionSource | null;
  aiExplanation: string;
}

export interface CreateAlertResponse {
  success: boolean;
  data?: PollutionAlert;
  error?: string;
}

export interface GetAlertsResponse {
  success: boolean;
  data?: PollutionAlert[];
  error?: string;
}