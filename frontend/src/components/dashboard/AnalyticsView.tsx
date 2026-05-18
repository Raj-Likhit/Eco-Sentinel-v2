import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { BackendResponse } from '../../types';

interface AnalyticsViewProps {
    data: BackendResponse | null;
}

const mockTrendData = [
    { day: 'Mon', pm25: 45, no2: 20 },
    { day: 'Tue', pm25: 52, no2: 22 },
    { day: 'Wed', pm25: 48, no2: 25 },
    { day: 'Thu', pm25: 61, no2: 28 },
    { day: 'Fri', pm25: 55, no2: 24 },
    { day: 'Sat', pm25: 40, no2: 18 },
    { day: 'Sun', pm25: 35, no2: 15 },
];

export default function AnalyticsView({ data }: AnalyticsViewProps) {
    return (
        <div className="space-y-6">
            <h2 className="font-heading text-2xl uppercase tracking-[-0.04em] text-white">Historical Analytics</h2>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="border border-white/[0.08] bg-[#0b0e11] p-5">
                    <h3 className="font-heading text-sm uppercase tracking-[0.14em] text-white">Weekly Pollutant Trend</h3>
                    <div className="mt-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockTrendData}>
                                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.32)" tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.32)" tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#05080a',
                                        borderColor: 'rgba(255,255,255,0.08)',
                                        borderRadius: '0px',
                                        color: '#fff',
                                        fontFamily: 'DM Mono'
                                    }}
                                />
                                <Line type="monotone" dataKey="pm25" stroke="#10b981" strokeWidth={1.5} dot={false} name="PM2.5" />
                                <Line type="monotone" dataKey="no2" stroke="#ef4444" strokeWidth={1.5} dot={false} name="NO2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="border border-white/[0.08] bg-[#0b0e11] p-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading text-sm uppercase tracking-[0.14em] text-white">Forecast Envelope</h3>
                        <span className="font-data text-[10px] uppercase tracking-[0.18em] text-emerald-500">Model Active</span>
                    </div>
                    <div className="mt-6 flex h-80 items-center justify-center">
                        <div className="w-full space-y-4">
                            <div className="flex h-48 items-end justify-between gap-2 border border-white/[0.06] bg-[#05080a] px-4 py-3">
                                {[30, 45, 35, 60, 80, 55, 40].map((height, index) => (
                                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                        <div className="w-full bg-white/10" style={{ height: `${height}%` }}>
                                            <div className="h-full w-full bg-emerald-500/70" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="font-data text-[11px] uppercase tracking-[0.18em] text-white/42">
                                Predictive confidence: {data ? Math.max(61, Math.min(96, 70 + Math.round(Math.abs(data.z_score) * 5))) : 87}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {['Avg AQI: 142', 'Peak Time: 18:00', 'Safest Day: Sunday', 'Dominant: PM2.5'].map((stat) => (
                    <div key={stat} className="border border-white/[0.08] bg-[#0b0e11] px-4 py-4 text-center font-data text-[11px] uppercase tracking-[0.16em] text-white/62">
                        {stat}
                    </div>
                ))}
            </div>
        </div>
    );
}
