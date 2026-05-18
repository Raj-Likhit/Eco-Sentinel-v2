import { NextResponse } from 'next/server';
import { ModelTrainingService } from '@/lib/backend/services/modelTraining';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId, days = 30 } = body;

    if (!stationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: stationId',
      }, { status: 400 });
    }

    // Generate mock historical data (in production, fetch from database)
    const historicalData = ModelTrainingService.generateMockHistoricalData(stationId, days);

    // Train model
    const modelMetrics = ModelTrainingService.trainModel(historicalData);

    return NextResponse.json({
      success: true,
      message: 'Model trained successfully',
      stationId,
      metrics: {
        baseline: {
          mean: Math.round(modelMetrics.mean * 10) / 10,
          stdDev: Math.round(modelMetrics.stdDev * 10) / 10,
          min: Math.round(modelMetrics.min * 10) / 10,
          max: Math.round(modelMetrics.max * 10) / 10,
          median: Math.round(modelMetrics.median * 10) / 10,
          q1: Math.round(modelMetrics.q1 * 10) / 10,
          q3: Math.round(modelMetrics.q3 * 10) / 10,
        },
        dataPoints: modelMetrics.dataPoints,
        trainingPeriodDays: modelMetrics.trainingPeriodDays,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error training model:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to train model',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
