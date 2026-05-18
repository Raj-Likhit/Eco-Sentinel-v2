import { BackendResponse } from '../../types';

interface AlertFeedProps {
    data: BackendResponse | null;
}

type AlertRow = {
    station: string;
    concentration: number;
    timestamp: string;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
};

function getAlertRows(data: BackendResponse | null): AlertRow[] {
    if (!data) {
        return [
            { station: 'IDA PASHAMYLARAM', concentration: 148.3, timestamp: '18:42:11', status: 'CRITICAL' },
            { station: 'SANATHNAGAR CAAQMS', concentration: 81.1, timestamp: '18:33:02', status: 'WARNING' },
            { station: 'BEGUMPET GRID', concentration: 28.4, timestamp: '18:21:44', status: 'NORMAL' },
        ];
    }

    return [
        {
            station: 'PRIMARY TARGET',
            concentration: data.pm25,
            timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--:--:--',
            status: data.anomaly_status,
        },
        {
            station: 'NO2 CROSS-CHECK',
            concentration: data.no2,
            timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--:--:--',
            status: data.no2 > 80 ? 'CRITICAL' : data.no2 > 45 ? 'WARNING' : 'NORMAL',
        },
        {
            station: 'AQI ENVELOPE',
            concentration: data.aqi,
            timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--:--:--',
            status: data.aqi > 180 ? 'CRITICAL' : data.aqi > 90 ? 'WARNING' : 'NORMAL',
        },
    ];
}

function getSeverityStyles(status: AlertRow['status']) {
    if (status === 'CRITICAL') {
        return {
            bar: 'bg-red-500',
            value: 'text-red-500',
            badge: 'border-red-500/30 bg-red-500/10 text-red-400',
        };
    }

    if (status === 'WARNING') {
        return {
            bar: 'bg-amber-500',
            value: 'text-amber-500',
            badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        };
    }

    return {
        bar: 'bg-emerald-500',
        value: 'text-emerald-500',
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    };
}

export default function AlertFeed({ data }: AlertFeedProps) {
    const rows = getAlertRows(data);

    return (
        <div className="hover-border-glow border border-white/[0.08] bg-[#0b0e11]">
            <div className="border-b border-white/[0.06] px-4 py-3 font-heading text-sm uppercase tracking-[0.14em] text-white">
                Alert Feed
            </div>

            {rows.map((row, index) => {
                const severity = getSeverityStyles(row.status);

                return (
                    <div 
                        key={`${row.station}-${row.timestamp}`} 
                        className="slide-in-left flex min-h-[72px] border-b border-white/[0.06] last:border-b-0"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`w-[3px] shrink-0 ${severity.bar}`} />
                        <div className="flex flex-1 items-center justify-between gap-4 px-4 py-4">
                            <div className="min-w-0">
                                <div className="font-data text-[12px] uppercase tracking-[0.18em] text-white">
                                    {row.station}
                                </div>
                                <div className="mt-2 font-body text-[11px] uppercase tracking-[0.12em] text-white/38">
                                    {row.timestamp}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-data text-xl ${severity.value}`}>
                                    {row.concentration.toFixed(1)}
                                </div>
                                <div className={`mt-2 inline-flex border px-2 py-1 font-body text-[10px] uppercase tracking-[0.18em] ${severity.badge}`}>
                                    {row.status}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
