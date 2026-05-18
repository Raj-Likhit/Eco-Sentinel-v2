'use client';

import useSWR from 'swr';
import { GetMapDataResponse, GetAlertsResponse } from '@eco-sentinel/shared';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const fetcher = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }
        
        return res.json();
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
};

export function usePollutionData() {
    const { data: mapResponse, error: mapError, isLoading: mapLoading } = useSWR<GetMapDataResponse>(
        `${API_URL}/api/map/data`,
        fetcher,
        { 
            refreshInterval: 60000,
            revalidateOnFocus: false,
            shouldRetryOnError: true,
            errorRetryCount: 2,
            onError: (error) => {
                console.error('Map data fetch error:', error);
            }
        }
    );

    const { data: alertsResponse, error: alertsError, isLoading: alertsLoading } = useSWR<GetAlertsResponse>(
        `${API_URL}/api/alerts`,
        fetcher,
        { 
            refreshInterval: 30000,
            revalidateOnFocus: false,
            shouldRetryOnError: true,
            errorRetryCount: 2,
            onError: (error) => {
                console.error('Alerts fetch error:', error);
            }
        }
    );

    const mapData = mapResponse?.success ? {
        ...mapResponse.data,
        activeAlerts: alertsResponse?.success ? alertsResponse.data : []
    } : null;

    return {
        mapData,
        isLoading: mapLoading || alertsLoading,
        error: mapError || alertsError
    };
}
