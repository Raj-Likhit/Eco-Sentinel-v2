import { PollutionData, IndustrialZone } from '@eco-sentinel/shared';

export interface PlumePoint {
    lat: number;
    lng: number;
    intensity: number; // 0 to 1
}

export class PlumeService {
    /**
     * Calculates a simplified 2D Gaussian Plume dispersion pattern.
     * @param source Smallest detected pollution source (e.g. industrial chimney)
     * @param windSpeed Wind speed in m/s (from forensics/OpenAQ)
     * @param windDir Wind direction in degrees (where it's coming FROM)
     * @returns Array of points representing the plume geometry
     */
    static calculatePlume(
        source: { lat: number; lng: number },
        concentration: number,
        windSpeed: number,
        windDir: number
    ): PlumePoint[] {
        const points: PlumePoint[] = [];
        const numSteps = 10;
        const stepSize = 0.005; // ~500m per step
        
        // Wind direction is "from", we want "to"
        const angleRad = (windDir + 180) * (Math.PI / 180);
        
        // Dispersion coefficients (simplified Pasquill stability class D)
        const ay = 0.08;
        const az = 0.06;

        for (let i = 1; i <= numSteps; i++) {
            const distance = i * stepSize;
            
            // Downwind center point
            const centerLat = source.lat + Math.cos(angleRad) * distance;
            const centerLng = source.lng + Math.sin(angleRad) * distance;

            // At each step, we calculate Crosswind spread
            const numCrossPoints = 5;
            const spreadWidth = distance * 0.4; // Plume widens over distance

            for (let j = -numCrossPoints; j <= numCrossPoints; j++) {
                const crossFactor = j / numCrossPoints;
                const offset = crossFactor * spreadWidth;
                
                // Perpendicular angle
                const perpAngle = angleRad + Math.PI / 2;
                const pLat = centerLat + Math.cos(perpAngle) * offset;
                const pLng = centerLng + Math.sin(perpAngle) * offset;

                // Intensity based on distance and crosswind (Gaussian)
                const distDecay = 1 / (1 + i * 0.5); // Conc. drops with distance
                const crossDecay = Math.exp(-(j * j) / (numCrossPoints * numCrossPoints));
                const intensity = distDecay * crossDecay;

                if (intensity > 0.05) {
                    points.push({
                        lat: pLat,
                        lng: pLng,
                        intensity: parseFloat(intensity.toFixed(3))
                    });
                }
            }
        }

        return points;
    }
}
