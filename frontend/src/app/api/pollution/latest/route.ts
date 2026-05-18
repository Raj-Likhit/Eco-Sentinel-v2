import { NextResponse } from 'next/server';
import { getStations, stationToPollutionData } from '@/lib/backend/pollutionLogic';

export async function GET() {
  try {
    const stations = await getStations();
    return NextResponse.json({
      success: true,
      data: stations.map(stationToPollutionData)
    });
  } catch (error) {
    console.error('[server] Failed to fetch latest pollution data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pollution data' }, { status: 500 });
  }
}
