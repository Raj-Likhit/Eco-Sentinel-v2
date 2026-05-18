'use client';

import { BarChart3, LayoutDashboard, LogOut, Settings } from 'lucide-react';

type Tab = 'overview' | 'analytics' | 'settings';

interface SidebarProps {
    activeTab: Tab;
    onChange: (tab: Tab) => void;
}

const items = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onChange }: SidebarProps) {
    return (
        <aside className="group hidden h-screen w-14 shrink-0 overflow-hidden border-r border-white/[0.06] transition-[width] duration-200 ease-in-out hover:w-[220px] md:flex md:flex-col">
            <div className="flex h-12 items-center border-b border-white/[0.06] px-4">
                <span className="status-dot mr-3 h-[8px] w-[8px]" />
                <span className="whitespace-nowrap font-heading text-[0.72rem] uppercase tracking-[0.22em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Eco-Sentinel
                </span>
            </div>

            <nav className="flex-1 pt-3">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`flex h-12 w-full items-center gap-4 border-l-2 px-4 text-left transition-all duration-200 ${
                                isActive
                                    ? 'border-l-emerald-500 text-white'
                                    : 'border-l-transparent text-white/30 hover:border-l-white/20 hover:text-white/70'
                            }`}
                            style={{ transitionDelay: `${index * 30}ms` }}
                        >
                            <Icon size={18} className={`transition-colors ${isActive ? 'text-emerald-500' : 'text-white/30'}`} />
                            <span className="whitespace-nowrap font-body text-[0.78rem] uppercase tracking-[0.16em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="border-t border-white/[0.06] px-4 py-4">
                <div className="flex items-center gap-3">
                    <span className="status-dot h-[7px] w-[7px]" />
                    <span className="whitespace-nowrap font-data text-[10px] uppercase tracking-[0.2em] text-white/48 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        System Operational
                    </span>
                </div>

                <button className="mt-4 flex h-10 w-full items-center gap-4 border-l-2 border-l-transparent text-white/30 transition-all hover:border-l-white/20 hover:text-white/70">
                    <LogOut size={18} className="text-white/30" />
                    <span className="whitespace-nowrap font-body text-[0.78rem] uppercase tracking-[0.16em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
