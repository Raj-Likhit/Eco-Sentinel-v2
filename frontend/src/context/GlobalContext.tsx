'use client';

import React, { createContext, useContext, useState } from 'react';

export interface PinnedCity {
    id: string;
    location: string;
    lat: number;
    lng: number;
    severity: 'CRITICAL' | 'WARNING' | 'NORMAL';
    pm25: number;
}

interface GlobalContextType {
    pinnedCities: PinnedCity[];
    addPinnedCity: (city: PinnedCity) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [pinnedCities, setPinnedCities] = useState<PinnedCity[]>([]);

    const addPinnedCity = (city: PinnedCity) => {
        setPinnedCities(prev => {
            // Check if city already exists to prevent duplicates
            if (prev.some(p => p.id === city.id)) return prev;

            // If we have 5, reset and start fresh with this one (as per "after which it resets")
            if (prev.length >= 5) {
                return [city];
            }

            return [...prev, city];
        });
    };

    return (
        <GlobalContext.Provider value={{ pinnedCities, addPinnedCity }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}
