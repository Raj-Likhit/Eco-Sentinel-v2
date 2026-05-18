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
  q1: number;
  q3: number;
  dataPoints: number;
  trainingPeriodDays: number;
}

export interface AnomalyDetectionResult {
  zscore: number;
  isPollutionEvent: boolean;
  confidence: number;
  threshold: number;
  anomalyType: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SENSOR_ERROR';
  explanation: string;
}

export class ModelTrainingService {
  static trainModel(historicalData: TrainingData[]): ModelMetrics {
    if (historicalData.length === 0) {
      throw new Error('No historical data provided for training');
    }

    const pm25Values = historicalData.map((d) => d.pm25).sort((a, b) => a - b);
    const mean = this.calculateMean(pm25Values);
    const stdDev = this.calculateStdDev(pm25Values, mean);
    const min = pm25Values[0];
    const max = pm25Values[pm25Values.length - 1];
    const median = this.calculatePercentile(pm25Values, 50);
    const q1 = this.calculatePercentile(pm25Values, 25);
    const q3 = this.calculatePercentile(pm25Values, 75);

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

  static detectAnomaly(currentValue: number, modelMetrics: ModelMetrics): AnomalyDetectionResult {
    const zscore = (currentValue - modelMetrics.mean) / modelMetrics.stdDev;

    let anomalyType: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SENSOR_ERROR' = 'NORMAL';
    let threshold = 1.5;
    let confidence = 0.68;

    if (zscore < -3) {
      anomalyType = 'SENSOR_ERROR';
      threshold = -3;
      confidence = 0.997;
    } else if (zscore > 2.5) {
      anomalyType = 'CRITICAL';
      threshold = 2.5;
      confidence = 0.994;
    } else if (zscore > 1.5) {
      anomalyType = 'WARNING';
      threshold = 1.5;
      confidence = 0.933;
    } else if (zscore >= -1) {
      anomalyType = 'NORMAL';
      threshold = 1;
      confidence = 0.68;
    }

    const modelAccuracy = this.calculateModelAccuracy(modelMetrics);
    const finalConfidence = confidence * modelAccuracy;

    return {
      zscore: Math.round(zscore * 100) / 100,
      isPollutionEvent: anomalyType === 'CRITICAL' || anomalyType === 'WARNING',
      confidence: Math.round(finalConfidence * 10000) / 100,
      threshold,
      anomalyType,
      explanation: this.getAnomalyExplanation(zscore, anomalyType, modelMetrics),
    };
  }

  private static calculateModelAccuracy(metrics: ModelMetrics): number {
    let accuracy = 0.7;

    if (metrics.dataPoints >= 720) accuracy += 0.15;
    else if (metrics.dataPoints >= 360) accuracy += 0.1;
    else if (metrics.dataPoints >= 180) accuracy += 0.05;

    const coefficientOfVariation = metrics.stdDev / metrics.mean;
    if (coefficientOfVariation < 0.3) accuracy += 0.1;
    else if (coefficientOfVariation < 0.5) accuracy += 0.05;

    if (metrics.trainingPeriodDays >= 30) accuracy += 0.05;
    else if (metrics.trainingPeriodDays >= 14) accuracy += 0.02;

    return Math.min(accuracy, 0.99);
  }

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

  private static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

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

  static generateMockHistoricalData(stationId: string, days: number = 30): TrainingData[] {
    const data: TrainingData[] = [];
    const now = new Date();
    const baselineMean = this.getStationBaseline(stationId);

    for (let i = days * 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const dayOfWeek = timestamp.getDay();
      const hour = timestamp.getHours();

      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.0;
      const hourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 0.9;
      const randomVariation = (Math.random() - 0.5) * 20;

      const pm25 = Math.max(10, baselineMean * weekdayFactor * hourFactor + randomVariation);

      data.push({
        timestamp,
        pm25: Math.round(pm25 * 10) / 10,
      });
    }

    return data;
  }

  private static getStationBaseline(stationId: string): number {
    const baselines: Record<string, number> = {
      's1': 65,
      's2': 58,
      's3': 42,
      's4': 40,
      's5': 35,
      's6': 48,
      's7': 38,
      's8': 36,
      's9': 39,
    };
    return baselines[stationId] || 50;
  }
}
