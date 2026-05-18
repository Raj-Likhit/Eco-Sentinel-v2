/**
 * Statistical utilities for pollution data analysis
 */

export interface StatisticalMetrics {
  mean: number;
  stdDev: number;
  zscore: number;
}

/**
 * Calculate Z-score for a given value
 * Z-score = (value - mean) / standard deviation
 * 
 * Interpretation:
 * - Z-score > 2: Significant anomaly (95% confidence)
 * - Z-score > 3: Extreme anomaly (99.7% confidence)
 * - Z-score < -2: Unusually low (potential sensor error)
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Calculate mean of an array
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of an array
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Get historical baseline for a station
 * In production, this would fetch from a database
 * For now, returns typical Hyderabad PM2.5 baseline
 */
export function getHistoricalBaseline(stationId: string): { mean: number; stdDev: number } {
  // Typical PM2.5 baselines for Hyderabad stations
  // These are based on historical data patterns
  const baselines: Record<string, { mean: number; stdDev: number }> = {
    's1': { mean: 65, stdDev: 18 }, // Pashamylaram - industrial area
    's2': { mean: 58, stdDev: 16 }, // Sanathnagar
    's3': { mean: 42, stdDev: 12 }, // Hyderabad Central
    's4': { mean: 40, stdDev: 11 }, // Charminar
    's5': { mean: 35, stdDev: 10 }, // Gachibowli Residential
    's6': { mean: 48, stdDev: 14 }, // Cherlapally
    's7': { mean: 38, stdDev: 11 }, // Begumpet
    's8': { mean: 36, stdDev: 10 }, // Gachibowli Forecast
    's9': { mean: 39, stdDev: 11 }, // Nehru Zoo
  };

  return baselines[stationId] || { mean: 50, stdDev: 15 };
}

/**
 * Calculate Z-score for a station's PM2.5 reading
 * Uses historical baseline for the station
 */
export function calculateStationZScore(stationId: string, pm25Value: number): number {
  const baseline = getHistoricalBaseline(stationId);
  return calculateZScore(pm25Value, baseline.mean, baseline.stdDev);
}

/**
 * Classify pollution level based on Z-score
 */
export function classifyByZScore(zscore: number): 'NORMAL' | 'WARNING' | 'CRITICAL' {
  if (zscore > 2.5) return 'CRITICAL'; // > 99% anomaly
  if (zscore > 1.5) return 'WARNING'; // > 93% anomaly
  return 'NORMAL';
}

/**
 * Get anomaly description
 */
export function getAnomalyDescription(zscore: number): string {
  if (zscore > 3) return 'Extreme anomaly - immediate investigation required';
  if (zscore > 2.5) return 'Significant anomaly - likely pollution event';
  if (zscore > 2) return 'Notable anomaly - possible pollution source';
  if (zscore > 1.5) return 'Moderate anomaly - elevated levels detected';
  if (zscore > 1) return 'Slight elevation - monitor for changes';
  if (zscore < -2) return 'Unusually low - possible sensor malfunction';
  return 'Within normal range';
}
