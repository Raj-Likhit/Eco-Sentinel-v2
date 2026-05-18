import { NextResponse } from 'next/server';
import { globalState } from '@/lib/backend/state';
import { PollutionAlert, CreateAlertRequest } from '@eco-sentinel/shared';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: globalState.alerts
  });
}

export async function POST(request: Request) {
  try {
    const requestData: CreateAlertRequest = await request.json();
    const newAlert: PollutionAlert = {
      id: `manual-${Date.now()}`,
      pollutionData: requestData.pollutionData,
      identifiedSource: requestData.identifiedSource,
      aiExplanation: requestData.aiExplanation,
      timestamp: new Date(),
      status: 'investigating'
    };

    globalState.alerts = [newAlert, ...globalState.alerts].slice(0, 25);

    return NextResponse.json({
      success: true,
      data: newAlert
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create alert' }, { status: 500 });
  }
}
