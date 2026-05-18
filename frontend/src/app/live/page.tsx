'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const LiveGlobe = dynamic(() => import('../../components/LiveGlobe'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-black">
            <div className="text-center space-y-4">
                <Skeleton className="w-32 h-32 rounded-full mx-auto bg-slate-800" />
                <p className="text-slate-400 animate-pulse">Initializing Global Uplink...</p>
            </div>
        </div>
    )
});

export default function LivePage() {
    return (
        <main className="min-h-[calc(100vh-5rem)] bg-black">
            <div className="relative h-[calc(100vh-5rem)]">
                <div className="absolute left-4 top-4 z-10 max-w-xs rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl">
                    <h1 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Live Global Feed
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Real-time visualization of environmental anomalies detected by the Eco-Sentinel satellite network.
                    </p>
                    <div className="mt-4 flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-slate-300">Critical</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-300">Normal</span>
                        </div>
                    </div>
                </div>
                <LiveGlobe />
            </div>
        </main>
    );
}
