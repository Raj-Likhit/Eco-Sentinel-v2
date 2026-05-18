export interface Station {
  id: string;
  name: string;
  source: string;
  lat: number;
  lng: number;
  pm25: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  zscore: number;
}

export interface AlertRequest {
  station: Station;
  timestamp: string;
}
