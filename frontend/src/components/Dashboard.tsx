'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BackendResponse } from '../types';
import OverviewView from './dashboard/OverviewView';
import AnalyticsView from './dashboard/AnalyticsView';
import SettingsView from './dashboard/SettingsView';
import { useGlobal } from '../context/GlobalContext';
import Sidebar from './dashboard/Sidebar';
import TopBar from './dashboard/TopBar';

type Tab = 'overview' | 'analytics' | 'settings';

export default function Dashboard() {
    const { addPinnedCity } = useGlobal();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BackendResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!searchQuery) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            const toastId = toast.loading(`Searching for ${searchQuery}...`);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const res = await fetch(`/api/live?zone=${encodeURIComponent(searchQuery)}`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (res.status === 404) {
                    const errorMsg = `Location '${searchQuery}' not found`;
                    setError(errorMsg);
                    toast.error(errorMsg, { id: toastId });
                    setData(null);
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`);
                }

                const jsonData = await res.json();

                const safeData: BackendResponse = {
                    aqi: jsonData.aqi || 0,
                    pm25: jsonData.pm25 || 0,
                    no2: jsonData.no2 || 0,
                    humidity: jsonData.humidity || 0,
                    z_score: jsonData.z_score || 0,
                    anomaly_status: jsonData.anomaly_status || 'UNKNOWN',
                    satellite_context: jsonData.satellite_context || { ndvi: 0, ndwi: 0 },
                    ai_advisory: jsonData.ai_advisory || 'No data available.',
                    timestamp: jsonData.timestamp,
                    history: jsonData.history || [],
                    lat: jsonData.lat,
                    lng: jsonData.lng
                };

                setData(safeData);
                toast.success(`Data loaded for ${searchQuery}`, { id: toastId });

                if (safeData.lat !== undefined && safeData.lng !== undefined) {
                    addPinnedCity({
                        id: `search-${Date.now()}`,
                        location: searchQuery,
                        lat: safeData.lat,
                        lng: safeData.lng,
                        severity: safeData.anomaly_status as 'CRITICAL' | 'WARNING' | 'NORMAL',
                        pm25: safeData.pm25
                    });
                }
            } catch (error: any) {
                console.error('Error fetching data:', error);
                
                let errorMsg = 'Failed to fetch data';
                if (error.name === 'AbortError') {
                    errorMsg = 'Request timed out. Please try again.';
                } else if (error.message) {
                    errorMsg = error.message;
                }
                
                setError(errorMsg);
                toast.error(errorMsg, { id: toastId });
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [addPinnedCity, searchQuery]);

    const getZScoreColor = (z: number) => {
        if (Math.abs(z) > 3) return 'text-red-500';
        if (Math.abs(z) > 1.5) return 'text-amber-500';
        return 'text-emerald-500';
    };

    return (
        <div className="min-h-screen bg-[#05080a] text-white">
            <div className="flex min-h-screen">
                <Sidebar activeTab={activeTab} onChange={setActiveTab} />

                <main className="flex min-h-screen flex-1 flex-col">
                    <TopBar
                        activeTab={activeTab}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onSearchSubmit={() => setSearchQuery(inputValue)}
                    />

                    <div className="flex-1 px-6 py-6">
                        {activeTab === 'overview' && (
                            <OverviewView
                                data={data}
                                loading={loading}
                                error={error}
                                getZScoreColor={getZScoreColor}
                            />
                        )}
                        {activeTab === 'analytics' && <AnalyticsView data={data} />}
                        {activeTab === 'settings' && <SettingsView />}
                    </div>
                </main>
            </div>
        </div>
    );
}
