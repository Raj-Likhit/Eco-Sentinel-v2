import React from 'react';
import Image from 'next/image';
import {
    Activity,
    Satellite,
    Wind
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { BackendResponse } from '../../types';
import { Skeleton } from '../ui/Skeleton';
import MetricCard from './MetricCard';
import AlertFeed from './AlertFeed';

interface OverviewViewProps {
    data: BackendResponse | null;
    loading: boolean;
    error: string | null;
    getZScoreColor: (z: number) => string;
}

export default function OverviewView({ data, loading, error, getZScoreColor }: OverviewViewProps) {
    return (
        <div className="space-y-6">
            {error && (
                <div className="slide-in-left border-l-2 border-red-500 bg-red-500/10 px-4 py-3">
                    <div className="font-data text-[11px] uppercase tracking-[0.18em] text-red-400">
                        Error
                    </div>
                    <p className="mt-1 font-body text-sm text-white/68">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Real-Time PM2.5" value={data ? data.pm25 : '--'} unit="ug/m3" threshold={100} isLoading={loading} />
                <MetricCard title="Anomaly Score" value={data ? data.z_score.toFixed(2) : '--'} unit="z" threshold={3} isLoading={loading} />
                <MetricCard title="Satellite NDVI" value={data?.satellite_context?.ndvi?.toFixed(2) || '--'} unit="index" threshold={0.8} isLoading={loading} />
                <MetricCard title="Humidity" value={data ? data.humidity : '--'} unit="%" threshold={85} isLoading={loading} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <div className="hover-border-glow border border-white/[0.08] bg-[#0b0e11] p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <div className="font-heading text-sm uppercase tracking-[0.14em] text-white">Deviation from Baseline</div>
                            <div className="mt-1 font-body text-[11px] uppercase tracking-[0.12em] text-white/38">
                                24 hour telemetry window
                            </div>
                        </div>
                        <Activity size={16} className="text-white/32" />
                    </div>

                    <div className="h-80">
                        {data ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.history || []}>
                                    <defs>
                                        <linearGradient id="overviewArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.32)" tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.32)" tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} domain={[-4, 4]} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#05080a',
                                            borderColor: 'rgba(255,255,255,0.08)',
                                            borderRadius: '0px',
                                            color: '#fff',
                                            fontFamily: 'DM Mono'
                                        }}
                                    />
                                    <ReferenceLine y={3} stroke="rgba(239,68,68,0.65)" strokeDasharray="4 4" />
                                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                                    <Area type="monotone" dataKey="z_score" stroke="#10b981" strokeWidth={1.5} fill="url(#overviewArea)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : loading ? (
                            <Skeleton className="h-full w-full border border-white/[0.08] bg-[#05080a]" />
                        ) : (
                            <div className="flex h-full items-center justify-center font-data text-[12px] uppercase tracking-[0.16em] text-white/32">
                                No telemetry locked
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <AlertFeed data={data} />

                    <div className="hover-border-glow border border-white/[0.08] bg-[#0b0e11] p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="font-heading text-sm uppercase tracking-[0.14em] text-white">AI Advisory</div>
                            <Satellite size={16} className="text-white/32" />
                        </div>
                        
                        <div className="hover-lift mb-5 overflow-hidden border border-white/[0.08]">
                            <Image
                                src="/images/satellite-context-thumb.webp"
                                alt="Satellite context"
                                width={400}
                                height={400}
                                className="w-full"
                            />
                        </div>

                        <div className="border-l border-emerald-500/40 pl-4">
                            <div className="font-data text-[11px] uppercase tracking-[0.18em] text-emerald-500">
                                System Output
                            </div>
                            <p className="mt-3 font-body text-sm text-white/68">
                                {loading ? 'Compiling operator brief...' : data?.ai_advisory || 'System idle. Awaiting search target.'}
                            </p>
                        </div>
                        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                            <div className="flex items-center gap-2 font-data text-[10px] uppercase tracking-[0.18em] text-white/35">
                                <Wind size={12} className="text-white/28" />
                                {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--:--:--'}
                            </div>
                            <div className={`font-data text-[10px] uppercase tracking-[0.18em] ${data ? getZScoreColor(data.z_score) : 'text-white/30'}`}>
                                {data?.anomaly_status || 'Standby'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
