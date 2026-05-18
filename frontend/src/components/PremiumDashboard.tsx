'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePollutionData } from '../hooks/usePollutionData';
import MetricCard from './forensic/MetricCard';
import AlertRow from './forensic/AlertRow';
import MapPanel from './forensic/MapPanel';
import ForensicPanel from './forensic/ForensicPanel';
import { Station, IndustrialZone, WindData } from './forensic/types';
import { severityColor, pm25Color } from './forensic/utils';
import { generatePDFReport } from '../utils/reportGenerator';

// Mock data
const MOCK_STATIONS: Station[] = [
  { id: 's1', name: 'IDA PASHAMYLARAM CAAQMS', source: 'CPCB', lat: 17.525, lng: 78.215, pm25: 152.4, status: 'CRITICAL', zscore: 4.2 },
  { id: 's2', name: 'SANATHNAGAR CAAQMS', source: 'CPCB', lat: 17.455, lng: 78.437, pm25: 67.1, status: 'WARNING', zscore: 1.8 },
  { id: 's3', name: 'HYDERABAD CENTRAL', source: 'OpenAQ', lat: 17.385, lng: 78.486, pm25: 38.2, status: 'NORMAL', zscore: 0.3 },
  { id: 's4', name: 'CHARMINAR HERITAGE', source: 'OpenAQ', lat: 17.361, lng: 78.474, pm25: 44.7, status: 'NORMAL', zscore: 0.6 },
  { id: 's5', name: 'GACHIBOWLI RESIDENTIAL', source: 'PurpleAir', lat: 17.441, lng: 78.349, pm25: 29.3, status: 'NORMAL', zscore: -0.2 },
  { id: 's6', name: 'CHERLAPALLY RESIDENTIAL', source: 'PurpleAir', lat: 17.434, lng: 78.577, pm25: 51.8, status: 'WARNING', zscore: 1.1 },
  { id: 's7', name: 'BEGUMPET FORECAST', source: 'SAFAR', lat: 17.445, lng: 78.468, pm25: 41.2, status: 'NORMAL', zscore: 0.4 },
  { id: 's8', name: 'GACHIBOWLI FORECAST', source: 'SAFAR', lat: 17.429, lng: 78.342, pm25: 33.6, status: 'NORMAL', zscore: 0.1 },
  { id: 's9', name: 'NEHRU ZOO CAAQMS', source: 'CPCB', lat: 17.346, lng: 78.451, pm25: 35.8, status: 'NORMAL', zscore: 0.2 },
];

const INDUSTRIAL_ZONES: IndustrialZone[] = [
  { id: 'z1', name: 'PATANCHERU INDUSTRIAL', lat: 17.530, lng: 78.199, radiusKm: 3.2 },
  { id: 'z2', name: 'BOLLARAM CLUSTER', lat: 17.545, lng: 78.238, radiusKm: 2.1 },
  { id: 'z3', name: 'NACHARAM INDUSTRIAL', lat: 17.397, lng: 78.542, radiusKm: 1.8 },
  { id: 'z4', name: 'CHERLAPALLY INDUSTRIAL', lat: 17.451, lng: 78.591, radiusKm: 1.5 },
];

const WIND: WindData = { speed: 3.2, direction: 315, gust: 4.8 };

export default function PremiumDashboard() {
  const [selectedStation, setSelectedStation] = useState<Station>(MOCK_STATIONS[0]);
  const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
  const [time, setTime] = useState(new Date());
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [modelConfidence, setModelConfidence] = useState<number | null>(null);
  const { mapData, isLoading, error } = usePollutionData();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSimulateSpike = async () => {
    // Ask for recipient email
    const recipientEmail = prompt(
      'Enter your email address to receive the alert.\n\nNote: This simulates sending an alert to authorities. In production, this would notify the environmental enforcement team.',
      ''
    );

    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const spikeStation: Station = {
      id: 's1',
      name: 'IDA PASHAMYLARAM CAAQMS',
      source: 'CPCB',
      lat: 17.525,
      lng: 78.215,
      pm25: 287.6,
      status: 'CRITICAL',
      zscore: 6.8,
    };

    const updatedStations = stations.map((st) =>
      st.id === 's1' ? spikeStation : st
    );

    setStations(updatedStations);
    setSelectedStation(spikeStation);
    
    // Show initial spike detection toast
    toast.error('CRITICAL SPIKE DETECTED: Pashamylaram PM2.5 287.6 µg/m³', {
      duration: 5000,
    });

    // Automatically send alert to authorities
    try {
      toast.loading('Training model on 30 days of data...', { id: 'alert-sending' });
      
      // Step 1: Train model on 30 days of historical data
      const trainResponse = await fetch('/api/email-alerts/train-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: 's1',
          days: 30,
        }),
      });

      const trainResult = await trainResponse.json();

      if (!trainResult.success) {
        throw new Error('Failed to train model');
      }

      toast.loading('Detecting anomaly with trained model...', { id: 'alert-sending' });

      // Step 2: Detect anomaly using trained model
      const anomalyResponse = await fetch('/api/email-alerts/detect-anomaly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: 's1',
          currentValue: 287.6,
        }),
      });

      const anomalyResult = await anomalyResponse.json();

      if (!anomalyResult.success) {
        throw new Error('Failed to detect anomaly');
      }

      // Update station with trained model Z-score
      const trainedZScore = anomalyResult.anomaly.zscore;
      const accuracy = anomalyResult.anomaly.accuracy;
      const threshold = anomalyResult.anomaly.threshold;
      
      // Calculate confidence based on Z-score and threshold
      // Higher Z-score relative to threshold = higher confidence
      const zscoreConfidence = Math.min(Math.abs(trainedZScore) / Math.abs(threshold) * 100, 99.9);
      
      setModelAccuracy(accuracy);
      setModelConfidence(zscoreConfidence);
      
      const updatedSpikeStation = {
        ...spikeStation,
        zscore: trainedZScore,
      };

      setSelectedStation(updatedSpikeStation);

      toast.loading('Generating report and notifying authorities...', { id: 'alert-sending' });
      
      // Step 3: Send alert with trained model metrics
      const response = await fetch('/api/email-alerts/critical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station: updatedSpikeStation,
          timestamp: new Date().toISOString(),
          recipientEmail: recipientEmail,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Alert sent to ${result.recipient}. Case ID: ${result.caseId}\nModel Accuracy: ${accuracy.toFixed(1)}%`,
          { id: 'alert-sending', duration: 6000 }
        );
      } else {
        toast.error(`Failed to send alert: ${result.error}`, { id: 'alert-sending' });
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send alert to authorities. Check backend connection.', {
        id: 'alert-sending',
      });
    }
  };

  const handleDispatch = () => {
    if (selectedStation.status === 'CRITICAL') {
      toast.success(
        `Inspection team dispatched to ${selectedStation.name}. ETA: 45 minutes.`,
        { duration: 4000 }
      );
    }
  };

  const handleExportReport = () => {
    generatePDFReport(selectedStation);
    toast.success('Report exported successfully', { duration: 3000 });
  };
  const criticalCount = stations.filter((s) => s.status === 'CRITICAL').length;
  const warningCount = stations.filter((s) => s.status === 'WARNING').length;
  const avgPm25 = (stations.reduce((a, s) => a + s.pm25, 0) / stations.length).toFixed(1);
  const maxZscore = Math.max(...stations.map((s) => s.zscore)).toFixed(1);

  const sparkPm25 = [38, 42, 45, 61, 78, 95, 118, 138, 149, 152];
  const sparkAqi = [62, 64, 68, 78, 90, 105, 119, 132, 143, 148];
  const sparkNo2 = [18, 19, 21, 23, 22, 25, 27, 26, 28, 29];

  return (
    <div className="w-full h-screen flex flex-col font-data overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&family=Inter+Tight:wght@400;500&display=swap');
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>

      {/* TOPBAR */}
      <div className="h-12 shrink-0 flex items-center px-4 gap-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-2 mr-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-heading font-extrabold text-[13px] tracking-[0.18em]">ECO-SENTINEL</span>
        </div>
        <div className="flex-1" />
        {criticalCount > 0 && (
          <div className="px-2 py-0.5 font-data text-[9px] tracking-[0.12em]" style={{ 
            background: 'var(--critical-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--accent-red)'
          }}>
            {criticalCount} CRITICAL
          </div>
        )}
        {warningCount > 0 && (
          <div className="px-2 py-0.5 font-data text-[9px] tracking-[0.12em]" style={{
            background: 'var(--warning-bg)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: 'var(--accent-amber)'
          }}>
            {warningCount} WARNING
          </div>
        )}
        <button
          onClick={handleSimulateSpike}
          className="spike-button text-[8px] tracking-[0.12em] px-3 py-1.5 font-semibold transition-all duration-200"
          style={{
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: '1px solid #b91c1c',
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            animation: 'spike-pulse 2s ease-in-out infinite'
          }}
          title="Simulate critical pollution spike"
        >
          ⚠ SIMULATE SPIKE
        </button>
        <div className="flex items-center gap-2 pl-4" style={{ borderLeft: '1px solid var(--border-primary)' }}>
          <div className="w-[5px] h-[5px] rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 tracking-[0.1em]">LIVE</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{time.toISOString().slice(11, 19)} UTC</span>
        </div>
      </div>

      {/* TICKER */}
      <div className="h-7 shrink-0 overflow-hidden flex items-center" style={{ borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-tertiary)' }}>
        <div className="flex whitespace-nowrap animate-[ticker_28s_linear_infinite]">
          {[...Array(2)].map((_, ri) =>
            stations.map((s, i) => (
              <span
                key={`${ri}-${i}`}
                className="text-[9px] tracking-[0.1em] px-6 opacity-70"
                style={{ color: severityColor(s.status) }}
              >
                PM2.5 · {s.name} · {s.pm25.toFixed(1)} µg/m³ · {s.status}
                <span style={{ color: 'var(--text-muted)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>———</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-[260px] shrink-0 flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--border-primary)' }}>
          <div className="p-3 grid grid-cols-2 gap-1.5">
            <MetricCard label="AVG PM2.5" value={avgPm25} unit="µg/m³" color={pm25Color(Number(avgPm25))} spark={sparkPm25} />
            <MetricCard label="PEAK AQI" value="148" unit="AQI" color="#ef4444" spark={sparkAqi} />
            <MetricCard label="NO₂" value="28.4" unit="ppb" color="#f59e0b" spark={sparkNo2} />
            <MetricCard label="MAX Z-SCORE" value={maxZscore} unit="σ" color="#ef4444" sub="ANOMALY" />
          </div>

          <div className="mt-3" style={{ borderBottom: '1px solid var(--border-secondary)' }} />

          <div className="px-4 py-2 flex justify-between items-center">
            <div className="text-[9px] tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>STATION FEED</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{stations.length} ACTIVE</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {stations
              .sort((a, b) => b.pm25 - a.pm25)
              .map((st) => (
                <AlertRow key={st.id} station={st} onClick={setSelectedStation} active={selectedStation?.id === st.id} />
              ))}
          </div>

          <div className="p-4 flex items-center gap-1.5" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <div className="w-[5px] h-[5px] rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>SYSTEM OPERATIONAL</span>
          </div>
        </div>

        {/* MAP PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--border-primary)' }}>
          <div className="px-3.5 py-2 flex justify-between items-center shrink-0" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <div className="text-[9px] tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              HYDERABAD AIRSHED · GAUSSIAN PLUME DISPERSION · PASQUILL CLASS D
            </div>
            <div className="flex gap-3">
              {[
                ['4 SRC', 'var(--text-secondary)'],
                ['4 ZONES', 'rgba(239,68,68,0.8)'],
                [`${stations.length} STN`, 'var(--text-secondary)'],
              ].map(([v, c]) => (
                <span key={v} className="text-[9px] tracking-[0.1em]" style={{ color: c }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <MapPanel
              stations={stations}
              industrialZones={INDUSTRIAL_ZONES}
              wind={WIND}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-64 shrink-0 flex flex-col overflow-hidden">
          <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <div className="text-[9px] tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>CHAIN OF EVIDENCE</div>
          </div>
          <div className="flex-1 overflow-auto">
            <ForensicPanel
              station={selectedStation}
              modelAccuracy={modelAccuracy}
              modelConfidence={modelConfidence}
              onDispatch={handleDispatch}
              onExportReport={handleExportReport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
