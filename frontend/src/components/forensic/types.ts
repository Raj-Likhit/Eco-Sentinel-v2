'use client';

export interface Station {
  id: string;
  name: string;
  source: string;
  lat: number;
  lng: number;
  pm25: number;
  status: 'CRITICAL' | 'WARNING' | 'NORMAL';
  zscore: number;
}

export interface IndustrialZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface WindData {
  speed: number;
  direction: number;
  gust: number;
}

export interface PlumePoint {
  lat: number;
  lng: number;
  intensity: number;
}
