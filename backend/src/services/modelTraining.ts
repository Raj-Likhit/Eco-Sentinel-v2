/**
 * Machine Learning Model Training Service
 * Trains on 30 days of historical data to establish dynamic baselines
 * and detect anomalies with accuracy metrics
 */

export interface TrainingData {
  timestamp: Date;
  pm25: number;
  no2?: number;
  so2?: number;
}

export interface ModelMetrics {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
  q1: number; // 25th percentile
  q3: number; // 75th percentile
  dataPoints: number;
  trainingPeriodDays: number;
}

export interface AnomalyDetectionResult {
  zscore: number;
  isPollutionEvent: boolean;
  confidence: number; // 0-1, accuracy of prediction
  threshold: number; // Z-score threshold used
  anomalyType: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SENSOR_ERROR';
  explanation: string;
}

/**
 * Model Training Service
 * Trains statistical models on historical data
 */
export class ModelTrainingService {
  /**
   * Train model on 30 days of historical data
   * Returns statistical metrics for anomaly detection
   */
  static trainModel(historicalData: TrainingData[]): ModelMetrics {
    if (historicalData.length === 0) {
      throw new Error('No historical data provided for training');
    }

    // Extract PM2.5 values
    const pm25Values = historicalData.map((d) => d.pm25).sort((a, b) => a - b);

    // Calculate statistics
    const mean = this.calculateMean(pm25Values);
    const stdDev = this.calculateStdDev(pm25Values, mean);
    const min = pm25Values[0];
    const max = pm25Values[pm25Values.length - 1];
    const median = this.calculatePercentile(pm25Values, 50);
    const q1 = this.calculatePercentile(pm25Values, 25);
    const q3 = this.calculatePercentile(pm25Values, 75);

    // Calculate training period
    const dates = historicalData.map((d) => new Date(d.timestamp).getTime());
    const trainingPeriodDays = Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24));

    return {
      mean,
      stdDev,
      min,
      max,
      median,
      q1,
      q3,
      dataPoints: pm25Values.length,
      trainingPeriodDays,
    };
  }

  /**
   * Detect anomalies using trained model
   * Returns confidence score (accuracy) of the detection
   */
  static detectAnomaly(currentValue: number, modelMetrics: ModelMetrics): AnomalyDetectionResult {
    // Calculate Z-score
    const zscore = (currentValue - modelMetrics.mean) / modelMetrics.stdDev;

    // Determine anomaly type and threshold
    let anomalyType: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SENSOR_ERROR' = 'NORMAL';
    let threshold = 1.5;
    let confidence = 0.68; // 1 sigma = 68% confidence

    // Check for sensor error (unusually low)
    if (zscore < -3) {
      anomalyType = 'SENSOR_ERROR';
      threshold = -3;
      confidence = 0.997; // 3 sigma = 99.7% confidence
    }
    // Check for critical pollution
    else if (zscore > 2.5) {
      anomalyType = 'CRITICAL';
      threshold = 2.5;
      confidence = 0.994; // 2.5 sigma ≈ 99.4% confidence
    }
    // Check for warning level
    else if (zscore > 1.5) {
      anomalyType = 'WARNING';
      threshold = 1.5;
      confidence = 0.933; // 1.5 sigma ≈ 93.3% confidence
    }
    // Normal range
    else if (zscore >= -1) {
      anomalyType = 'NORMAL';
      threshold = 1;
      confidence = 0.68; // 1 sigma = 68% confidence
    }

    // Calculate model accuracy based on data quality
    const modelAccuracy = this.calculateModelAccuracy(modelMetrics);
    const finalConfidence = confidence * modelAccuracy;

    return {
      zscore: Math.round(zscore * 100) / 100,
      isPollutionEvent: anomalyType === 'CRITICAL' || anomalyType === 'WARNING',
      confidence: Math.round(finalConfidence * 10000) / 100, // Convert to percentage
      threshold,
      anomalyType,
      explanation: this.getAnomalyExplanation(zscore, anomalyType, modelMetrics),
    };
  }

  /**
   * Calculate model accuracy based on data quality and quantity
   * More data points = higher accuracy
   * Lower variance = higher accuracy
   */
  private static calculateModelAccuracy(metrics: ModelMetrics): number {
    let accuracy = 0.7; // Base accuracy

    // Bonus for sufficient data points (30 days = ~720 hourly readings)
    if (metrics.dataPoints >= 720) accuracy += 0.15;
    else if (metrics.dataPoints >= 360) accuracy += 0.1;
    else if (metrics.dataPoints >= 180) accuracy += 0.05;

    // Bonus for stable baseline (low variance)
    const coefficientOfVariation = metrics.stdDev / metrics.mean;
    if (coefficientOfVariation < 0.3) accuracy += 0.1;
    else if (coefficientOfVariation < 0.5) accuracy += 0.05;

    // Bonus for complete training period
    if (metrics.trainingPeriodDays >= 30) accuracy += 0.05;
    else if (metrics.trainingPeriodDays >= 14) accuracy += 0.02;

    return Math.min(accuracy, 0.99); // Cap at 99%
  }

  /**
   * Get human-readable explanation of anomaly
   */
  private static getAnomalyExplanation(
    zscore: number,
    anomalyType: string,
    metrics: ModelMetrics
  ): string {
    const deviation = Math.abs(zscore);

    switch (anomalyType) {
      case 'CRITICAL':
        return `Extreme pollution event detected. Reading is ${deviation.toFixed(1)}σ above baseline (${metrics.mean.toFixed(0)} µg/m³). Immediate investigation required.`;
      case 'WARNING':
        return `Elevated pollution levels detected. Reading is ${deviation.toFixed(1)}σ above baseline. Monitor for changes.`;
      case 'SENSOR_ERROR':
        return `Unusually low reading detected. Possible sensor malfunction. Reading is ${deviation.toFixed(1)}σ below baseline.`;
      case 'NORMAL':
      default:
        return `Reading within normal range. Baseline: ${metrics.mean.toFixed(0)} ± ${metrics.stdDev.toFixed(0)} µg/m³.`;
    }
  }

  /**
   * Calculate mean
   */
  private static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private static calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate percentile
   */
  private static calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return sortedValues[lower];
    }

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Generate 30 days of mock historical data for testing
   * Simulates realistic PM2.5 patterns
   */
  static generateMockHistoricalData(stationId: string, days: number = 30): TrainingData[] {
    const data: TrainingData[] = [];
    const now = new Date();
    const baselineMean = this.getStationBaseline(stationId);

    for (let i = days * 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

      // Simulate realistic PM2.5 with daily and hourly patterns
      const dayOfWeek = timestamp.getDay();
      const hour = timestamp.getHours();

      // Higher pollution on weekdays, lower on weekends
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.0;

      // Higher pollution during morning and evening rush hours
      const hourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 0.9;

      // Add random variation
      const randomVariation = (Math.random() - 0.5) * 20;

      const pm25 = Math.max(10, baselineMean * weekdayFactor * hourFactor + randomVariation);

      data.push({
        timestamp,
        pm25: Math.round(pm25 * 10) / 10,
      });
    }

    return data;
  }

  /**
   * Get baseline mean for a station
   */
  private static getStationBaseline(stationId: string): number {
    const baselines: Record<string, number> = {
      's1': 65, // Pashamylaram - industrial
      's2': 58, // Sanathnagar
      's3': 42, // Hyderabad Central
      's4': 40, // Charminar
      's5': 35, // Gachibowli Residential
      's6': 48, // Cherlapally
      's7': 38, // Begumpet
      's8': 36, // Gachibowli Forecast
      's9': 39, // Nehru Zoo
    };
    return baselines[stationId] || 50;
  }
}
