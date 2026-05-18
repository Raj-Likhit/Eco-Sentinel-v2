export interface BackendResponse {
    aqi: number;
    pm25: number;
    no2: number;
    humidity: number;
    z_score: number;
    anomaly_status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    satellite_context: {
        ndvi: number; // Vegetation health
        ndwi: number; // Water index
    } | null;
    ai_advisory: string;
    timestamp?: string;
    history?: {
        time: string;
        z_score: number;
    }[];
    lat?: number;
    lng?: number;
}
