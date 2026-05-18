import { NextResponse } from 'next/server';
import { PollutionData, PollutionSource } from '@eco-sentinel/shared';
import { findNearestIndustrialZone, buildAlert, mergeAlerts } from '@/lib/backend/pollutionLogic';
import { ForensicService } from '@/lib/backend/services/forensics';
import { ALERT_THRESHOLD } from '@/lib/backend/state';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pollutionData = body?.pollutionData as PollutionData | undefined;

    if (!pollutionData) {
      return NextResponse.json({ success: false, error: 'pollutionData is required' }, { status: 400 });
    }

    const nearestZone = findNearestIndustrialZone(pollutionData);
    const evidence = await ForensicService.analyzeChainOfEvidence(pollutionData, nearestZone);

    const source: PollutionSource = {
      zone: nearestZone,
      confidence: evidence.confidence || 0.5,
      analysisTimestamp: new Date(),
      evidence
    };

    if (source.confidence >= ALERT_THRESHOLD) {
      mergeAlerts([buildAlert(source, pollutionData)]);
    }

    return NextResponse.json({
      success: true,
      data: source,
      explanation: `Based on wind trajectory and spectral evidence, ${nearestZone.name} is the most likely source.`
    });
  } catch (error) {
    console.error('[server] Failed to identify source:', error);
    return NextResponse.json({ success: false, error: 'Failed to identify pollution source' }, { status: 500 });
  }
}
