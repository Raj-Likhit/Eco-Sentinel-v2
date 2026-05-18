'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type Tab = 'overview' | 'analytics' | 'settings';

interface TopBarProps {
    activeTab: Tab;
    inputValue: string;
    onInputChange: (value: string) => void;
    onSearchSubmit: () => void;
}

const tabLabels: Record<Tab, string> = {
    overview: 'Overview',
    analytics: 'Analytics',
    settings: 'Settings',
};

export default function TopBar({ activeTab, inputValue, onInputChange, onSearchSubmit }: TopBarProps) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-white/[0.06] px-6">
            <div className="font-heading text-[13px] uppercase tracking-[0.18em] text-white/50">
                {tabLabels[activeTab]}
            </div>

            <div className="relative mx-6 hidden w-full max-w-xl md:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            onSearchSubmit();
                        }
                    }}
                    placeholder="SEARCH ZONE OR STATION..."
                    className="h-9 w-full border border-white/[0.12] bg-[#0b0e11] pl-9 pr-4 font-data text-[11px] uppercase tracking-[0.16em] text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-3 font-data text-[10px] uppercase tracking-[0.18em] text-white/55">
                <Image
                    src="/images/globe-marker-icon.jpg"
                    alt=""
                    width={24}
                    height={24}
                    className="opacity-60"
                />
                <span className="status-dot h-[7px] w-[7px]" />
                <span>Live</span>
                <span className="text-white/38">{now.toLocaleTimeString()}</span>
            </div>
        </header>
    );
}
