export interface PollutionAlert {
    id: string;
    severity: 'CRITICAL' | 'MODERATE' | 'SAFE';
    title: string;
    message: string;
    time: string;
    status: 'active' | 'resolved';
    location: string;
    lat: number;
    lng: number;
    pm25: number;
}

export const MOCK_ALERTS: PollutionAlert[] = [
    {
        id: "evt_hyd_01",
        severity: 'CRITICAL',
        title: 'Hyderabad Air Crisis',
        message: 'Severe PM2.5 levels (185) detected in industrial corridor.',
        time: '5m ago',
        status: 'active',
        location: 'Hyderabad',
        lat: 17.3850,
        lng: 78.4867,
        pm25: 185
    },
    {
        id: "evt_del_02",
        severity: 'SAFE',
        title: 'Delhi Air Quality',
        message: 'Air quality is currently safe (PM2.5: 45).',
        time: '12m ago',
        status: 'resolved',
        location: 'New Delhi',
        lat: 28.6139,
        lng: 77.2090,
        pm25: 45
    },
    {
        id: "evt_mum_03",
        severity: 'MODERATE',
        title: 'Mumbai Haze',
        message: 'Moderate pollution levels (PM2.5: 110) reported.',
        time: '25m ago',
        status: 'active',
        location: 'Mumbai',
        lat: 19.0760,
        lng: 72.8777,
        pm25: 110
    }
];

export const getLiveAlerts = (isSimulationMode: boolean): PollutionAlert[] => {
    if (!isSimulationMode) return MOCK_ALERTS;

    return MOCK_ALERTS.map(alert => ({
        ...alert,
        pm25: Math.round(alert.pm25 * (1 + (Math.random() * 0.2 - 0.1)))
    }));
};
