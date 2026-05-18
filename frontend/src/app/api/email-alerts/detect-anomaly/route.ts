import { NextResponse } from 'next/server';
import { ModelTrainingService } from '@/lib/backend/services/modelTraining';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId, currentValue } = body;

    if (!stationId || currentValue === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: stationId, currentValue',
      }, { status: 400 });
    }

    // Train model on historical data
    const historicalData = ModelTrainingService.generateMockHistoricalData(stationId, 30);
    const modelMetrics = ModelTrainingService.trainModel(historicalData);

    // Detect anomaly
    const anomalyResult = ModelTrainingService.detectAnomaly(currentValue, modelMetrics);

    return NextResponse.json({
      success: true,
      stationId,
      currentValue,
      baseline: {
        mean: Math.round(modelMetrics.mean * 10) / 10,
        stdDev: Math.round(modelMetrics.stdDev * 10) / 10,
      },
      anomaly: {
        zscore: anomalyResult.zscore,
        isPollutionEvent: anomalyResult.isPollutionEvent,
        accuracy: anomalyResult.confidence,
        threshold: anomalyResult.threshold,
        anomalyType: anomalyResult.anomalyType,
        explanation: anomalyResult.explanation,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error detecting anomaly:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to detect anomaly',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
