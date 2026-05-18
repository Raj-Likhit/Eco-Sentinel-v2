'use client';

import Sparkline from './Sparkline';

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  color: string;
  spark?: number[];
  sub?: string;
}

export default function MetricCard({ label, value, unit, color, spark, sub }: MetricCardProps) {
  return (
    <div className="metric-card-texture p-[14px] flex flex-col gap-1 min-w-0" style={{ border: '1px solid var(--border-card)', background: 'var(--bg-secondary)' }}>
      <div className="font-data text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </div>
      <div className="font-data text-[28px] font-medium leading-none mt-0.5" style={{ color }}>
        {value}
        <span className="text-[12px] ml-1" style={{ color: 'var(--text-tertiary)' }}>{unit}</span>
      </div>
      {spark && <Sparkline color={color} data={spark} />}
      {sub && <div className="font-data text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{sub}</div>}
    </div>
  );
}
