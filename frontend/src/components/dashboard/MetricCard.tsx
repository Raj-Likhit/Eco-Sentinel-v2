import { Skeleton } from "../ui/Skeleton";

interface MetricCardProps {
    title: string;
    value: string | number;
    unit: string;
    threshold?: number;
    isLoading?: boolean;
}

export default function MetricCard({ title, value, unit, threshold = 100, isLoading }: MetricCardProps) {
    if (isLoading) {
        return <Skeleton className="h-40 w-full border border-white/[0.08] bg-[#0b0e11]" />;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const isCritical = numValue > threshold;
    const isWarning = !isCritical && numValue > threshold * 0.6;
    const toneClass = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500';
    const sparkline = Array.from({ length: 10 }, (_, index) => {
        const modifier = Math.sin(index * 0.82) * (numValue > 0 ? Math.min(numValue / 18, 10) : 2);
        return Math.max(6, 26 - modifier - index);
    });
    const points = sparkline.map((point, index) => `${index * 18},${point}`).join(' ');

    return (
        <div className="hover-lift hover-border-glow metric-card-texture border border-white/[0.08] bg-[#0b0e11] p-5">
            <div className="relative font-body text-[11px] uppercase tracking-[0.18em] text-white/40">
                {title}
            </div>

            <div className="mt-4 flex items-end gap-2">
                <span className={`font-data text-[32px] leading-none ${toneClass}`}>
                    {value}
                </span>
                <span className="font-data text-[12px] uppercase tracking-[0.14em] text-white/34">
                    {unit}
                </span>
            </div>

            <div className="mt-5">
                <svg viewBox="0 0 162 32" className="h-8 w-full">
                    <polyline
                        fill="none"
                        stroke="rgba(255,255,255,0.14)"
                        strokeWidth="1"
                        points="0,24 162,24"
                    />
                    <polyline
                        fill="none"
                        stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
                        strokeWidth="1.5"
                        points={points}
                    />
                </svg>
            </div>
        </div>
    );
}
