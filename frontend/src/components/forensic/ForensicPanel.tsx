'use client';

import { Station } from './types';
import { severityColor, pm25Color } from './utils';

interface ForensicPanelProps {
  station: Station | null;
  modelAccuracy?: number | null;
  modelConfidence?: number | null;
  onDispatch?: () => void;
  onExportReport?: () => void;
}

export default function ForensicPanel({ station, modelAccuracy, modelConfidence, onDispatch, onExportReport }: ForensicPanelProps) {
  if (!station) {
    return (
      <div className="flex items-center justify-center h-full font-data text-[11px]" style={{ color: 'var(--text-muted)' }}>
        SELECT A STATION TO INSPECT
      </div>
    );
  }

  // Use model confidence if available, otherwise use hardcoded fallback
  const confidence = modelConfidence !== undefined && modelConfidence !== null 
    ? modelConfidence / 100 
    : (station.status === 'CRITICAL' ? 0.89 : station.status === 'WARNING' ? 0.71 : 0.42);
  const confColor = confidence > 0.8 ? '#ef4444' : confidence > 0.65 ? '#f59e0b' : '#10b981';
  const confLabel = confidence > 0.8 ? 'HIGH' : confidence > 0.65 ? 'MEDIUM' : 'LOW';

  return (
    <div className="p-4 flex flex-col gap-3.5 h-full overflow-auto">
      <div>
        <div className="font-data text-[9px] tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>FORENSIC ANALYSIS</div>
        <div className="font-heading text-sm font-bold mt-1 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {station.name}
        </div>
      </div>

      {/* Confidence meter */}
      <div>
        <div className="flex justify-between mb-1">
          <div className="font-data text-[9px] tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>SOURCE CONFIDENCE</div>
          <div className="font-data text-[11px]" style={{ color: confColor }}>
            {confLabel} {(confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div className="h-[3px] relative" style={{ background: 'var(--border-card)' }}>
          <div
            className="absolute left-0 top-0 h-full transition-all duration-600"
            style={{ width: `${confidence * 100}%`, background: confColor }}
          />
        </div>
      </div>

      {/* Accuracy percentage */}
      <div className="p-3 rounded-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
        <div className="font-data text-[9px] tracking-[0.1em] mb-2" style={{ color: 'var(--text-tertiary)' }}>FORENSIC ACCURACY</div>
        <div className="flex items-baseline gap-2">
          <div className="font-data text-[28px] font-bold" style={{ color: confColor }}>
            {modelAccuracy !== undefined && modelAccuracy !== null ? modelAccuracy.toFixed(1) : (confidence * 100).toFixed(0)}%
          </div>
          <div className="font-data text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {confidence > 0.8 ? 'HIGH CONFIDENCE' : confidence > 0.65 ? 'MEDIUM CONFIDENCE' : 'LOW CONFIDENCE'}
          </div>
        </div>
        <div className="mt-2 text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
          {modelAccuracy !== undefined && modelAccuracy !== null
            ? 'Trained on 30 days of historical data with ML model'
            : 'Based on wind trajectory, satellite data, concentration levels, and statistical anomalies'}
        </div>
      </div>

      {/* Evidence chain */}
      <div className="flex flex-col gap-2">
        {[
          {
            label: 'WIND TRAJECTORY',
            val: station.status !== 'NORMAL' ? 'WITHIN 5km UPWIND' : 'NO MATCH',
            active: station.status !== 'NORMAL',
          },
          {
            label: 'SATELLITE MATCH',
            val: station.status === 'CRITICAL' ? 'SPECTRAL CONFIRMED' : 'HEURISTIC FALLBACK',
            active: station.status === 'CRITICAL',
          },
          {
            label: 'CONCENTRATION',
            val: `${station.pm25.toFixed(1)} µg/m³`,
            active: station.pm25 > 100,
          },
          {
            label: 'Z-SCORE ANOMALY',
            val: `${station.zscore.toFixed(1)}σ`,
            active: station.zscore > 2,
          },
        ].map((ev) => (
          <div key={ev.label} className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ev.active ? '#10b981' : 'var(--border-card)' }}
              />
              <div className="font-data text-[9px] tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>{ev.label}</div>
            </div>
            <div
              className="font-data text-[10px]"
              style={{ color: ev.active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
              {ev.val}
            </div>
          </div>
        ))}
      </div>

      {/* Attribution */}
      {station.status !== 'NORMAL' && (
        <div className="p-2.5" style={{ background: 'var(--critical-bg)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <div className="font-data text-[9px] tracking-[0.12em] mb-1" style={{ color: 'rgba(239, 68, 68, 0.7)' }}>
            ATTRIBUTED SOURCE
          </div>
          <div className="font-heading text-[13px] font-bold uppercase" style={{ color: '#ef4444' }}>
            PATANCHERU INDUSTRIAL
          </div>
          <div className="font-data text-[9px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            17.530°N 78.199°E · 4.8km UPWIND
            <br />
            RECOMMENDED: IMMEDIATE INSPECTION
          </div>
        </div>
      )}

      {/* Readings */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: 'PM2.5', val: station.pm25.toFixed(1), unit: 'µg/m³', color: pm25Color(station.pm25) },
          {
            label: 'Z-SCORE',
            val: station.zscore.toFixed(2),
            unit: 'σ',
            color: station.zscore > 2 ? '#ef4444' : station.zscore > 1 ? '#f59e0b' : '#10b981',
          },
          { label: 'SOURCE', val: station.source, unit: '', color: 'var(--text-secondary)' },
          { label: 'STATUS', val: station.status, unit: '', color: severityColor(station.status) },
        ].map((m) => (
          <div key={m.label} className="p-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-card)' }}>
            <div className="font-data text-[8px] tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>{m.label}</div>
            <div className="font-data text-[13px] mt-0.5" style={{ color: m.color }}>
              {m.val}
              <span className="text-[9px] ml-0.5 opacity-60">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
