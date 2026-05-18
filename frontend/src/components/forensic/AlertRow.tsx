'use client';

import { Station } from './types';
import { severityColor } from './utils';

interface AlertRowProps {
  station: Station;
  onClick: (station: Station) => void;
  active: boolean;
}

export default function AlertRow({ station, onClick, active }: AlertRowProps) {
  const color = severityColor(station.status);
  return (
    <div
      onClick={() => onClick(station)}
      className="flex items-stretch cursor-pointer transition-colors duration-150"
      style={{ 
        background: active ? 'var(--bg-card)' : 'transparent',
        borderBottom: '1px solid var(--border-secondary)'
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--bg-card)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div className="w-[3px] shrink-0" style={{ background: color }} />
      <div className="p-[10px_12px] flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="font-data text-[11px] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--text-secondary)' }}>
            {station.name}
          </div>
          <div className="font-data text-[12px] ml-2 shrink-0" style={{ color }}>
            {station.pm25.toFixed(1)}
          </div>
        </div>
        <div className="flex justify-between mt-[3px]">
          <div className="font-data text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {station.source} · Z={station.zscore.toFixed(1)}
          </div>
          <div
            className="font-data text-[9px] px-[5px] py-[1px] tracking-[0.08em]"
            style={{ color, background: `${color}18` }}
          >
            {station.status}
          </div>
        </div>
      </div>
    </div>
  );
}
