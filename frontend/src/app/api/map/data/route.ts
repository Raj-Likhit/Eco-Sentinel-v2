import { NextResponse } from 'next/server';
import { buildMapData } from '@/lib/backend/pollutionLogic';

export async function GET() {
  try {
    const mapData = await buildMapData();
    return NextResponse.json({
      success: true,
      data: mapData
    });
  } catch (error) {
    console.error('[server] Failed to assemble map data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch map data' }, { status: 500 });
  }
}
