import { IndustrialZone, PollutionData, ForensicEvidence } from '@eco-sentinel/shared';
import { calculateDistance } from '../utils/geo';

/**
 * Advanced Forensic Service 
 * Implements the "Tool Use" phase of the Forensic AI Agent.
 */
export class ForensicService {
  
  /**
   * Triggers 'Wind Trace' for trajectory analysis.
   * Calculates a simplified upwind path based on station location.
   */
  static async traceWindTrajectory(data: PollutionData): Promise<{ latitude: number, longitude: number }[]> {
    // In a real scenario, this would fetch from a weather API (OpenWeather/Meteostat)
    // For this simulation, we simulate a North-West wind common in the region
    const windDirection = 315; // 315 degrees (North-West)
    const angleRad = (windDirection * Math.PI) / 180;
    
    const path: { latitude: number, longitude: number }[] = [];
    const stepCount = 5;
    const stepSize = 0.02; // Roughly 2km steps

    // The trajectory trace goes UPWIND (following the 'wind from' direction)
    const traceAngle = angleRad;

    for (let i = 0; i <= stepCount; i++) {
        path.push({
            latitude: data.location.latitude + Math.sin(traceAngle) * (i * stepSize),
            longitude: data.location.longitude + Math.cos(traceAngle) * (i * stepSize)
        });
    }

    return path;
  }

  /**
   * Calls the Python GEE Microservice for Sentinel-5P imagery match.
   */
  static async performSatelliteSpectralMatch(data: PollutionData, nearestZone: IndustrialZone): Promise<{ match: boolean; tileUrl?: string; confidence?: number }> {
    try {
      // Use environment variable for Python service URL, fallback to localhost for development
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
      const response = await fetch(`${pythonServiceUrl}/api/satellite/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          pollutant: data.pollutant
        })
      });
      if (response.ok) {
        const result = await response.json();
        return {
          match: result.spectralMatch,
          tileUrl: result.tileUrl,
          confidence: result.confidence
        };
      }
    } catch (error) {
      console.error("Error communicating with Python GEE service, falling back to heuristic:", error);
    }
    
    // Fallback logic
    const distanceToZone = calculateDistance(data.location, nearestZone.location);
    return { match: data.concentration > 60 && distanceToZone < 20 };
  }

  /**
   * Synthesizes Sensor + Wind + Satellite data into a final verdict.
   */
  static async analyzeChainOfEvidence(data: PollutionData, nearestZone: IndustrialZone): Promise<ForensicEvidence> {
    const trajectoryPath = await this.traceWindTrajectory(data);
    const satelliteResult = await this.performSatelliteSpectralMatch(data, nearestZone);
    
    // Calculate if the trajectory actually passes near the industrial zone
    // Simplified: Check if any point in trajectory is within 5km of zone
    const windTrajectoryMatch = trajectoryPath.some(point => 
        calculateDistance(point, nearestZone.location) < 5
    );

    // Confidence Calculation
    let confidence = 0.6; // Base 
    if (windTrajectoryMatch) confidence += 0.2;
    if (satelliteResult.match) confidence += (satelliteResult.confidence || 0.15);
    if (data.concentration > 100) confidence += 0.05;

    return {
      windTrajectoryMatch,
      satelliteSpectralMatch: satelliteResult.match,
      trajectoryPath,
      confidenceScore: Math.min(0.98, confidence),
      satelliteTileUrl: satelliteResult.tileUrl
    };
  }
}
