import { NextResponse } from 'next/server';
import { getStations, scoreStationMatch } from '@/lib/backend/pollutionLogic';
import { calculateDistance } from '@/lib/backend/utils/geo';
import { HYDERABAD_INDUSTRIAL_ZONES } from '@/lib/backend/state';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = String(searchParams.get('zone') || '').trim();

    if (!zone) {
      return NextResponse.json({ success: false, error: 'Zone parameter required' }, { status: 400 });
    }

    const stations = await getStations();
    const rankedStations = stations
      .map((station) => ({
        station,
        score: scoreStationMatch(station.stationName, zone)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const fallbackStations = rankedStations.length > 0
      ? rankedStations.map((entry) => entry.station)
      : [...stations].sort((a, b) => {
          const aDistance = calculateDistance(
            { latitude: a.location.latitude, longitude: a.location.longitude },
            HYDERABAD_INDUSTRIAL_ZONES[0].location
          );
          const bDistance = calculateDistance(
            { latitude: b.location.latitude, longitude: b.location.longitude },
            HYDERABAD_INDUSTRIAL_ZONES[0].location
          );
          return aDistance - bDistance;
        });

    const selectedStations = fallbackStations.slice(0, 5);
    const matchedZone = rankedStations.length > 0 ? rankedStations[0].station.stationName : selectedStations[0]?.stationName || zone;
    const avgPollution = selectedStations.length > 0
      ? Math.round(selectedStations.reduce((sum, station) => sum + station.concentration, 0) / selectedStations.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        zone,
        matchedZone,
        stations: selectedStations.map((station) => ({
          id: station.id,
          name: station.stationName,
          lat: station.location.latitude,
          lng: station.location.longitude,
          pm25: station.concentration,
          source: station.source
        })),
        weather: {
          temperature: 28,
          humidity: 65,
          windSpeed: avgPollution > 100 ? 14 : 10,
          windDirection: 310,
          condition: avgPollution > 100 ? 'Haze Detected' : 'Partly Cloudy'
        },
        avgPollution
      }
    });
  } catch (error) {
    console.error('[server] Failed to fetch live location data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch location data' }, { status: 500 });
  }
}
