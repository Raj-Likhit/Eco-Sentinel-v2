import React, { useState } from 'react';
import { Bell, Eye, RefreshCw, Settings } from 'lucide-react';

export default function SettingsView() {
    const [notifications, setNotifications] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [highContrast, setHighContrast] = useState(false);
    const [threshold, setThreshold] = useState(150);

    const Toggle = ({ enabled }: { enabled: boolean }) => (
        <div className={`relative h-5 w-11 border ${enabled ? 'border-emerald-500/60 bg-emerald-500/15' : 'border-white/[0.12] bg-[#05080a]'}`}>
            <span className={`absolute top-[1px] h-[15px] w-[15px] bg-white transition-transform ${enabled ? 'translate-x-[23px]' : 'translate-x-[1px]'}`} />
        </div>
    );

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="font-heading text-2xl uppercase tracking-[-0.04em] text-white">System Configuration</h2>

            <div className="border border-white/[0.08] bg-[#0b0e11] p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Bell size={18} className="text-amber-500" />
                    <div>
                        <h3 className="font-heading text-sm uppercase tracking-[0.14em] text-white">Alerts and Notifications</h3>
                        <p className="mt-2 font-body text-sm text-white/48">Manage how the enforcement desk receives priority incidents.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => setNotifications(!notifications)} className="flex w-full items-center justify-between border border-white/[0.06] bg-[#05080a] px-4 py-4 text-left">
                        <span className="font-body text-sm text-white/72">Enable push notifications</span>
                        <Toggle enabled={notifications} />
                    </button>

                    <div className="flex items-center justify-between border border-white/[0.06] bg-[#05080a] px-4 py-4">
                        <div>
                            <div className="font-body text-sm text-white/72">Critical threshold (AQI)</div>
                            <div className="mt-1 font-data text-[11px] uppercase tracking-[0.16em] text-white/35">Escalation threshold</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="50"
                                max="500"
                                step="10"
                                value={threshold}
                                onChange={(e) => setThreshold(parseInt(e.target.value))}
                                className="w-32 accent-emerald-500"
                            />
                            <span className="w-14 text-right font-data text-sm text-white">{threshold}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border border-white/[0.08] bg-[#0b0e11] p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Settings size={18} className="text-white/38" />
                    <div>
                        <h3 className="font-heading text-sm uppercase tracking-[0.14em] text-white">System Preferences</h3>
                        <p className="mt-2 font-body text-sm text-white/48">Tune behavior for operators working active environmental incidents.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => setAutoRefresh(!autoRefresh)} className="flex w-full items-center justify-between border border-white/[0.06] bg-[#05080a] px-4 py-4 text-left">
                        <div className="flex items-center gap-3">
                            <RefreshCw size={16} className="text-white/32" />
                            <span className="font-body text-sm text-white/72">Auto-refresh telemetry (30s)</span>
                        </div>
                        <Toggle enabled={autoRefresh} />
                    </button>

                    <button onClick={() => setHighContrast(!highContrast)} className="flex w-full items-center justify-between border border-white/[0.06] bg-[#05080a] px-4 py-4 text-left">
                        <div className="flex items-center gap-3">
                            <Eye size={16} className="text-white/32" />
                            <span className="font-body text-sm text-white/72">High contrast mode</span>
                        </div>
                        <Toggle enabled={highContrast} />
                    </button>
                </div>
            </div>
        </div>
    );
}
