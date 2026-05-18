'use client';

export default function DashboardLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#05080a]">
            <div className="relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 -m-12">
                    <svg className="loader-spin-slow h-48 w-48" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(16, 185, 129, 0.1)"
                            strokeWidth="0.5"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="1"
                            strokeDasharray="70 213"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Middle pulsing ring */}
                <div className="absolute inset-0 -m-8">
                    <svg className="h-40 w-40" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(16, 185, 129, 0.15)"
                            strokeWidth="0.5"
                            className="animate-pulse"
                        />
                    </svg>
                </div>

                {/* Center content */}
                <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-white/[0.08] bg-[#0b0e11]" />
                    <div className="relative">
                        <div className="status-dot h-3 w-3" />
                    </div>
                </div>

                {/* Orbiting dots */}
                <div className="loader-spin-reverse absolute inset-0 -m-12">
                    <div className="relative h-48 w-48">
                        <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-500" />
                        <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-500/60" />
                        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-500/40" />
                    </div>
                </div>

                {/* Text below */}
                <div className="absolute -bottom-16 left-1/2 w-64 -translate-x-1/2 text-center">
                    <div className="font-heading text-[13px] uppercase tracking-[0.24em] text-white/50">
                        Initializing
                    </div>
                    <div className="mt-2 font-data text-[10px] uppercase tracking-[0.2em] text-white/30">
                        Command Surface
                    </div>
                    
                    {/* Loading bar */}
                    <div className="mt-4 h-[1px] w-full overflow-hidden bg-white/[0.06]">
                        <div className="loader-bar h-full w-[40%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                    </div>
                </div>

                {/* Scanning lines effect */}
                <div className="pointer-events-none absolute inset-0 -m-12 overflow-hidden">
                    <div className="loader-scan h-[2px] w-48 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                </div>
            </div>
        </div>
    );
}
