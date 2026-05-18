// SHARED TYPES - The "Contract"
export interface PollutionData {
  pm25?: number;      
  pm10?: number;      
  no2?: number;
  id?: string;
  timestamp?: string | Date; 
  location?: string | { latitude: number; longitude: number };
  pollutant?: string;
  concentration?: number;
  unit?: string;
  source?: string;
}

export interface PollutionAlert {
  id: string;
  pollutionData?: PollutionData;
  identifiedSource?: PollutionSource;
  aiExplanation?: string;
  timestamp?: Date;
  status?: 'investigating' | 'verified' | 'cleared';
  severity?: "LOW" | "MEDIUM" | "CRITICAL"; 
  summary?: string;   
  ai_analysis?: {
    root_cause: string;       
    confidence_score: number; 
    recommended_actions: string[]; 
  };
  satellite_evidence?: {
    has_plume: boolean;
    image_url: string; 
  };
  attribution?: {
    suspect_name: string; 
    distance_km: number;
  };
}

export interface CreateAlertRequest {
  pollutionData: PollutionData;
  identifiedSource?: PollutionSource;
  aiExplanation?: string;
}

export interface PollutionSource {
  name?: string;
  lat?: number;
  lng?: number;
  type?: string;
  confidence: number;
  zone?: IndustrialZone;
  analysisTimestamp?: Date;
  evidence?: ForensicEvidence;
}

export interface WindVector {
  direction: number;
  speed: number;
  timestamp: string;
}

export interface IndustrialZone {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  type?: string;
  emissionHistory?: PollutionData[];
  location?: {
    latitude: number;
    longitude: number;
  };
  boundingBox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface ForensicEvidence {
  type?: string;
  confidence?: number;
  data?: any;
  windTrajectoryMatch?: boolean;
  satelliteSpectralMatch?: boolean;
  trajectoryPath?: { latitude: number; longitude: number }[];
  satelliteTileUrl?: string;
}

export interface MapData {
  zones: IndustrialZone[];
  alerts: PollutionAlert[];
  stations: any[];
}

export interface GetMapDataResponse {
  success: boolean;
  data: MapData;
}

export interface GetAlertsResponse {
  success: boolean;
  data: PollutionAlert[];
}

export interface ApiResponse {
  status: "success" | "error";
  data?: PollutionData | PollutionAlert;
  message?: string;
}