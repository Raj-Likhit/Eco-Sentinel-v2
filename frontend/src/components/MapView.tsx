'use client';

import { Map } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MapView() {
    const { theme } = useTheme();
    
    return (
        <div 
            className="glass-panel rounded-xl overflow-hidden relative min-h-[300px] flex items-center justify-center group"
            style={{ background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}
        >
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live Feed</span>
            </div>

            <div className="text-center opacity-50 group-hover:opacity-80 transition-opacity">
                <Map 
                    className="w-16 h-16 mx-auto mb-4" 
                    style={{ color: theme === 'dark' ? '#475569' : '#cbd5e1' }}
                />
                <p 
                    className="font-medium"
                    style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                >
                    Interactive Map Module
                </p>
                <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#64748b' : '#cbd5e1' }}
                >
                    Connecting to satellite stream...
                </p>
            </div>

            {/* Grid overlay for tech feel */}
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        </div>
    );
}
