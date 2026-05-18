import express, { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { AlertRequest } from '../types/pollution';
import { generatePDFBuffer } from '../utils/pdfGenerator';

const router = express.Router();

// POST /api/alerts/critical - Send critical pollution alert
router.post('/critical', async (req: Request, res: Response) => {
  try {
    const { station, timestamp }: AlertRequest = req.body;

    if (!station || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: station and timestamp',
      });
    }

    // Validate critical status
    if (station.status !== 'CRITICAL') {
      return res.status(400).json({
        success: false,
        error: 'Alert can only be sent for CRITICAL status stations',
      });
    }

    // Generate case ID
    const caseId = `ECO-${Date.now()}`;

    // Generate PDF report
    const pdfBuffer = await generatePDFBuffer({
      station,
      timestamp,
      caseId,
    });

    // Send email with PDF attachment
    const emailSent = await emailService.sendCriticalAlert(
      { station, timestamp, caseId },
      pdfBuffer
    );

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Critical alert sent successfully',
        caseId,
        recipient: process.env.AUTHORITY_EMAIL || 'test@example.com',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
      });
    }
  } catch (error) {
    console.error('Error sending critical alert:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/alerts/test - Test email configuration
router.get('/test', async (req: Request, res: Response) => {
  try {
    const isConnected = await emailService.testConnection();
    
    if (isConnected) {
      return res.status(200).json({
        success: true,
        message: 'Email service is configured correctly',
        config: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.AUTHORITY_EMAIL || 'test@example.com',
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Email service connection failed',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to test email service',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

import { ModelTrainingService } from '../services/modelTraining';

// POST /api/email-alerts/train-model - Train anomaly detection model
router.post('/train-model', async (req: Request, res: Response) => {
  try {
    const { stationId, days = 30 } = req.body;

    if (!stationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: stationId',
      });
    }

    // Generate mock historical data (in production, fetch from database)
    const historicalData = ModelTrainingService.generateMockHistoricalData(stationId, days);

    // Train model
    const modelMetrics = ModelTrainingService.trainModel(historicalData);

    return res.status(200).json({
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
    });
  } catch (error) {
    console.error('Error training model:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to train model',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/email-alerts/detect-anomaly - Detect anomalies using trained model
router.post('/detect-anomaly', async (req: Request, res: Response) => {
  try {
    const { stationId, currentValue } = req.body;

    if (!stationId || currentValue === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: stationId, currentValue',
      });
    }

    // Train model on historical data
    const historicalData = ModelTrainingService.generateMockHistoricalData(stationId, 30);
    const modelMetrics = ModelTrainingService.trainModel(historicalData);

    // Detect anomaly
    const anomalyResult = ModelTrainingService.detectAnomaly(currentValue, modelMetrics);

    return res.status(200).json({
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
    });
  } catch (error) {
    console.error('Error detecting anomaly:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to detect anomaly',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
