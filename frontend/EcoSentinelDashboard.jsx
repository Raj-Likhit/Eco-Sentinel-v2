import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA MODEL ──────────────────────────────────────────────────────────────

const STATIONS = [
  { id: "s1", name: "IDA PASHAMYLARAM CAAQMS", source: "CPCB", lat: 17.525, lng: 78.215, pm25: 152.4, status: "CRITICAL", zscore: 4.2 },
  { id: "s2", name: "SANATHNAGAR CAAQMS", source: "CPCB", lat: 17.455, lng: 78.437, pm25: 67.1, status: "WARNING", zscore: 1.8 },
  { id: "s3", name: "HYDERABAD CENTRAL", source: "OpenAQ", lat: 17.385, lng: 78.486, pm25: 38.2, status: "NORMAL", zscore: 0.3 },
  { id: "s4", name: "CHARMINAR HERITAGE", source: "OpenAQ", lat: 17.361, lng: 78.474, pm25: 44.7, status: "NORMAL", zscore: 0.6 },
  { id: "s5", name: "GACHIBOWLI RESIDENTIAL", source: "PurpleAir", lat: 17.441, lng: 78.349, pm25: 29.3, status: "NORMAL", zscore: -0.2 },
  { id: "s6", name: "CHERLAPALLY RESIDENTIAL", source: "PurpleAir", lat: 17.434, lng: 78.577, pm25: 51.8, status: "WARNING", zscore: 1.1 },
  { id: "s7", name: "BEGUMPET FORECAST", source: "SAFAR", lat: 17.445, lng: 78.468, pm25: 41.2, status: "NORMAL", zscore: 0.4 },
  { id: "s8", name: "GACHIBOWLI FORECAST", source: "SAFAR", lat: 17.429, lng: 78.342, pm25: 33.6, status: "NORMAL", zscore: 0.1 },
  { id: "s9", name: "NEHRU ZOO CAAQMS", source: "CPCB", lat: 17.346, lng: 78.451, pm25: 35.8, status: "NORMAL", zscore: 0.2 },
];

const INDUSTRIAL_ZONES = [
  { id: "z1", name: "PATANCHERU INDUSTRIAL", lat: 17.530, lng: 78.199, radiusKm: 3.2 },
  { id: "z2", name: "BOLLARAM CLUSTER", lat: 17.545, lng: 78.238, radiusKm: 2.1 },
  { id: "z3", name: "NACHARAM INDUSTRIAL", lat: 17.397, lng: 78.542, radiusKm: 1.8 },
  { id: "z4", name: "CHERLAPALLY INDUSTRIAL", lat: 17.451, lng: 78.591, radiusKm: 1.5 },
];

// Wind: NW at 315°, 3.2 m/s
const WIND = { speed: 3.2, direction: 315, gust: 4.8 };

// Gaussian plume: source = Pashamylaram, wind 315° = blowing SE
function generatePlume(sourceLat, sourceLng, windDir, windSpeed, concentration) {
  const points = [];
  const windDirRad = (windDir * Math.PI) / 180;
  const downwindDx = Math.sin(windDirRad + Math.PI); // downwind direction x
  const downwindDy = Math.cos(windDirRad + Math.PI); // downwind direction y

  const stability = 0.12; // Pasquill D
  const kmPerDeg = 111.0;

  for (let x = 0.2; x <= 18; x += 0.4) {
    const sigmaY = stability * x * Math.pow(1 + 0.0002 * x, -0.5);
    const sigmaZ = 0.08 * x * Math.pow(1 + 0.0015 * x, -0.5);
    const maxConc = concentration / (Math.PI * windSpeed * sigmaY * sigmaZ);

    for (let y = -sigmaY * 3.5; y <= sigmaY * 3.5; y += sigmaY * 0.3) {
      const intensity = Math.exp(-0.5 * (y / sigmaY) ** 2) * (maxConc / (concentration / (Math.PI * windSpeed * 0.1 * 0.1)));
      if (intensity < 0.04) continue;

      const perpDx = -downwindDy;
      const perpDy = downwindDx;
      const lat = sourceLat + (downwindDy * x + perpDy * y) / kmPerDeg;
      const lng = sourceLng + (downwindDx * x + perpDx * y) / (kmPerDeg * Math.cos(sourceLat * Math.PI / 180));
      points.push({ lat, lng, intensity: Math.min(intensity, 1) });
    }
  }
  return points;
}

// ─── COORDINATE HELPERS ──────────────────────────────────────────────────────
const MAP_CENTER = { lat: 17.44, lng: 78.39 };
const MAP_BOUNDS = { latSpan: 0.48, lngSpan: 0.62 };

function latLngToXY(lat, lng, w, h) {
  const x = ((lng - (MAP_CENTER.lng - MAP_BOUNDS.lngSpan / 2)) / MAP_BOUNDS.lngSpan) * w;
  const y = (1 - (lat - (MAP_CENTER.lat - MAP_BOUNDS.latSpan / 2)) / MAP_BOUNDS.latSpan) * h;
  return { x, y };
}

function degToRadius(latDeg, h) {
  return (latDeg / MAP_BOUNDS.latSpan) * h;
}

// ─── COLOR HELPERS ───────────────────────────────────────────────────────────
function severityColor(status) {
  if (status === "CRITICAL") return "#ef4444";
  if (status === "WARNING") return "#f59e0b";
  return "#10b981";
}

function pm25Color(v) {
  if (v > 100) return "#ef4444";
  if (v > 55) return "#f59e0b";
  return "#10b981";
}

// ─── SPARKLINE ───────────────────────────────────────────────────────────────
function Sparkline({ color, data }) {
  const w = 80, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 0.01)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color, spark, sub }) {
  return (
    <div style={{
      background: "#0b0e11",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 4,
      minWidth: 0,
    }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.38)", letterSpacing: "0.16em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 28, fontWeight: 500, color, lineHeight: 1, marginTop: 2 }}>
        {value}<span style={{ fontSize: 12, marginLeft: 4, color: "rgba(255,255,255,0.4)" }}>{unit}</span>
      </div>
      {spark && <Sparkline color={color} data={spark} />}
      {sub && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── ALERT ROW ───────────────────────────────────────────────────────────────
function AlertRow({ station, onClick, active }) {
  const color = severityColor(station.status);
  return (
    <div onClick={() => onClick(station)} style={{
      display: "flex", alignItems: "stretch", borderBottom: "1px solid rgba(255,255,255,0.05)",
      cursor: "pointer", background: active ? "rgba(16,185,129,0.04)" : "transparent",
      transition: "background 0.15s",
    }}>
      <div style={{ width: 3, background: color, flexShrink: 0 }} />
      <div style={{ padding: "10px 12px", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{station.name}</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color, marginLeft: 8, flexShrink: 0 }}>{station.pm25.toFixed(1)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{station.source} · Z={station.zscore.toFixed(1)}</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color, background: `${color}18`, padding: "1px 5px", letterSpacing: "0.08em" }}>{station.status}</div>
        </div>
      </div>
    </div>
  );
}

// ─── WIND ARROW ──────────────────────────────────────────────────────────────
function WindArrow({ x, y, direction, speed }) {
  const len = 18 + speed * 2;
  const rad = (direction * Math.PI) / 180;
  const dx = Math.sin(rad) * len, dy = -Math.cos(rad) * len;
  return (
    <g transform={`translate(${x},${y})`} opacity="0.5">
      <line x1={0} y1={0} x2={dx} y2={dy} stroke="#10b981" strokeWidth="1" />
      <circle cx={0} cy={0} r={2} fill="#10b981" />
      <polygon
        points={`${dx},${dy} ${dx - Math.cos(rad) * 5 - Math.sin(rad) * 3},${dy + Math.sin(rad) * 5 - Math.cos(rad) * 3} ${dx - Math.cos(rad) * 5 + Math.sin(rad) * 3},${dy + Math.sin(rad) * 5 + Math.cos(rad) * 3}`}
        fill="#10b981"
      />
    </g>
  );
}

// ─── MAP COMPONENT ───────────────────────────────────────────────────────────
function MapPanel({ selectedStation, onSelectStation }) {
  const [dim, setDim] = useState({ w: 600, h: 440 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDim({ w: Math.max(width, 200), h: Math.max(height, 200) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dim;

  const plumeSource = STATIONS[0];
  const plumePoints = generatePlume(plumeSource.lat, plumeSource.lng, WIND.direction, WIND.speed, plumeSource.pm25);

  // Wind arrows grid
  const windArrows = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    windArrows.push({ x: (w * (c + 1)) / 5, y: (h * (r + 1)) / 4 });
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative", background: "#05080a", overflow: "hidden" }}>
      {/* Topo grid */}
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="plumeGrad" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill="url(#grid)" />

        {/* Plume heatmap points */}
        {plumePoints.map((pt, i) => {
          const { x, y } = latLngToXY(pt.lat, pt.lng, w, h);
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) return null;
          const r = 6 + pt.intensity * 10;
          const opacity = pt.intensity * 0.55;
          const hue = 30 + (1 - pt.intensity) * 100; // red → yellow → green
          return (
            <circle key={i} cx={x} cy={y} r={r}
              fill={`hsla(${hue},90%,55%,${opacity})`}
            />
          );
        })}

        {/* Industrial zone circles */}
        {INDUSTRIAL_ZONES.map(zone => {
          const { x, y } = latLngToXY(zone.lat, zone.lng, w, h);
          const r = degToRadius(zone.radiusKm / 111, h);
          return (
            <g key={zone.id}>
              <circle cx={x} cy={y} r={r}
                fill="rgba(239,68,68,0.04)"
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="5 4"
                opacity="0.7"
              />
              <text x={x} y={y - r - 6} textAnchor="middle"
                fontFamily="'DM Mono',monospace" fontSize="9"
                fill="rgba(239,68,68,0.6)" letterSpacing="0.12em">
                {zone.name}
              </text>
            </g>
          );
        })}

        {/* Wind trajectory path from Pashamylaram (upwind trace NW → SE) */}
        {(() => {
          const src = latLngToXY(plumeSource.lat, plumeSource.lng, w, h);
          const tracePts = [];
          for (let i = 0; i <= 5; i++) {
            const dist = i * 2;
            const rad = ((WIND.direction) * Math.PI) / 180;
            const tLat = plumeSource.lat + Math.cos(rad) * dist / 111;
            const tLng = plumeSource.lng + Math.sin(rad) * dist / (111 * Math.cos(plumeSource.lat * Math.PI / 180));
            const pt = latLngToXY(tLat, tLng, w, h);
            tracePts.push(`${pt.x},${pt.y}`);
          }
          return <polyline points={tracePts.join(" ")} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />;
        })()}

        {/* Wind arrows */}
        {windArrows.map((a, i) => (
          <WindArrow key={i} x={a.x} y={a.y} direction={WIND.direction} speed={WIND.speed} />
        ))}

        {/* Station markers */}
        {STATIONS.map(st => {
          const { x, y } = latLngToXY(st.lat, st.lng, w, h);
          const col = severityColor(st.status);
          const isSelected = selectedStation?.id === st.id;
          const isCritical = st.status === "CRITICAL";
          return (
            <g key={st.id} style={{ cursor: "pointer" }} onClick={() => onSelectStation(st)}>
              {isCritical && (
                <circle cx={x} cy={y} r={14} fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3">
                  <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={isSelected ? 7 : 5}
                fill={col}
                stroke={isSelected ? "#fff" : col}
                strokeWidth={isSelected ? 1.5 : 0}
                opacity={0.9}
              />
              {(isSelected || isCritical) && (
                <text x={x + 9} y={y + 4}
                  fontFamily="'DM Mono',monospace" fontSize="9"
                  fill={col} opacity="0.9">
                  {st.name.split(" ")[0]} {st.pm25.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        {/* Map corner coords */}
        <text x={6} y={h - 6} fontFamily="'DM Mono',monospace" fontSize="8" fill="rgba(255,255,255,0.2)" letterSpacing="0.05em">
          17.18°N 78.08°E — 17.66°N 78.70°E · HYDERABAD
        </text>

        {/* Compass */}
        <g transform={`translate(${w - 36}, 30)`}>
          <line x1={0} y1={8} x2={0} y2={-8} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <polygon points="0,-12 -4,-4 4,-4" fill="rgba(255,255,255,0.7)" />
          <text x={0} y={20} textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="8" fill="rgba(255,255,255,0.4)">N</text>
        </g>
      </svg>

      {/* Map legend */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        background: "rgba(5,8,10,0.88)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "8px 10px",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        {[["PLUME DISPERSION", "#ef4444", "block"], ["INDUSTRIAL ZONE", "#ef4444", "dashed"], ["WIND TRAJECTORY", "#f59e0b", "dashed"], ["CRITICAL STATION", "#ef4444", "circle"], ["WARNING STATION", "#f59e0b", "circle"], ["NORMAL STATION", "#10b981", "circle"]].map(([label, color, type]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {type === "circle"
              ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              : <div style={{ width: 16, height: 1, background: type === "dashed" ? "transparent" : color, borderBottom: type === "dashed" ? `1px dashed ${color}` : "none", flexShrink: 0 }} />
            }
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Wind indicator overlay */}
      <div style={{
        position: "absolute", top: 12, left: 12,
        background: "rgba(5,8,10,0.88)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "6px 10px",
      }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>WIND VECTOR</div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#10b981", marginTop: 2 }}>
          {WIND.direction}° NW · {WIND.speed} m/s
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>GUST {WIND.gust} m/s · PASQUILL-D</div>
      </div>
    </div>
  );
}

// ─── FORENSIC PANEL ──────────────────────────────────────────────────────────
function ForensicPanel({ station }) {
  if (!station) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
      SELECT A STATION TO INSPECT
    </div>
  );

  const confidence = station.status === "CRITICAL" ? 0.89 : station.status === "WARNING" ? 0.71 : 0.42;
  const confColor = confidence > 0.8 ? "#ef4444" : confidence > 0.65 ? "#f59e0b" : "#10b981";
  const confLabel = confidence > 0.8 ? "HIGH" : confidence > 0.65 ? "MEDIUM" : "LOW";

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, height: "100%", overflow: "auto" }}>
      <div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.16em" }}>FORENSIC ANALYSIS</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 4, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{station.name}</div>
      </div>

      {/* Confidence meter */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SOURCE CONFIDENCE</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: confColor }}>{confLabel} {(confidence * 100).toFixed(0)}%</div>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${confidence * 100}%`, background: confColor, transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* Evidence chain */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "WIND TRAJECTORY", val: station.status !== "NORMAL" ? "WITHIN 5km UPWIND" : "NO MATCH", active: station.status !== "NORMAL" },
          { label: "SATELLITE MATCH", val: station.status === "CRITICAL" ? "SPECTRAL CONFIRMED" : "HEURISTIC FALLBACK", active: station.status === "CRITICAL" },
          { label: "CONCENTRATION", val: `${station.pm25.toFixed(1)} µg/m³`, active: station.pm25 > 100 },
          { label: "Z-SCORE ANOMALY", val: `${station.zscore.toFixed(1)}σ`, active: station.zscore > 2 },
        ].map(ev => (
          <div key={ev.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ev.active ? "#10b981" : "rgba(255,255,255,0.15)" }} />
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{ev.label}</div>
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: ev.active ? "#fff" : "rgba(255,255,255,0.3)" }}>{ev.val}</div>
          </div>
        ))}
      </div>

      {/* Attribution */}
      {station.status !== "NORMAL" && (
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", padding: "10px 12px" }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(239,68,68,0.6)", letterSpacing: "0.12em", marginBottom: 5 }}>ATTRIBUTED SOURCE</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>PATANCHERU INDUSTRIAL</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            17.530°N 78.199°E · 4.8km UPWIND<br />
            RECOMMENDED: IMMEDIATE INSPECTION
          </div>
        </div>
      )}

      {/* Readings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "PM2.5", val: station.pm25.toFixed(1), unit: "µg/m³", color: pm25Color(station.pm25) },
          { label: "Z-SCORE", val: station.zscore.toFixed(2), unit: "σ", color: station.zscore > 2 ? "#ef4444" : station.zscore > 1 ? "#f59e0b" : "#10b981" },
          { label: "SOURCE", val: station.source, unit: "", color: "rgba(255,255,255,0.6)" },
          { label: "STATUS", val: station.status, unit: "", color: severityColor(station.status) },
        ].map(m => (
          <div key={m.label} style={{ background: "#05080a", border: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>{m.label}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: m.color, marginTop: 3 }}>{m.val}<span style={{ fontSize: 9, marginLeft: 2, opacity: 0.6 }}>{m.unit}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHART ───────────────────────────────────────────────────────────────────
function MiniBarChart({ stations }) {
  const maxVal = Math.max(...stations.map(s => s.pm25));
  return (
    <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      {stations.sort((a, b) => b.pm25 - a.pm25).slice(0, 6).map(st => (
        <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", width: 80, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name.split(" ")[0]}</div>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(st.pm25 / maxVal) * 100}%`, background: pm25Color(st.pm25) }} />
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: pm25Color(st.pm25), width: 44, textAlign: "right" }}>{st.pm25.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function EcoSentinelDashboard() {
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState("overview");
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const criticalCount = STATIONS.filter(s => s.status === "CRITICAL").length;
  const warningCount = STATIONS.filter(s => s.status === "WARNING").length;
  const avgPm25 = (STATIONS.reduce((a, s) => a + s.pm25, 0) / STATIONS.length).toFixed(1);
  const maxZscore = Math.max(...STATIONS.map(s => s.zscore)).toFixed(1);

  const sparkPm25 = [38, 42, 45, 61, 78, 95, 118, 138, 149, 152];
  const sparkAqi = [62, 64, 68, 78, 90, 105, 119, 132, 143, 148];
  const sparkNo2 = [18, 19, 21, 23, 22, 25, 27, 26, 28, 29];

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#05080a",
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Mono',monospace",
      overflow: "hidden",
      color: "#fff",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&family=Inter+Tight:wght@400;500&display=swap');
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0b0e11; }
        ::-webkit-scrollbar-thumb { background: #2d3540; }
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        height: 48, flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", padding: "0 16px",
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.18em", color: "#fff" }}>ECO-SENTINEL</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: 16 }}>
          {["OVERVIEW", "FORENSICS", "ANALYTICS"].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.12em",
              color: tab === t.toLowerCase() ? "#fff" : "rgba(255,255,255,0.3)",
              padding: "0 14px", height: 48,
              borderBottom: tab === t.toLowerCase() ? "1.5px solid #10b981" : "1.5px solid transparent",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Status pills */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {criticalCount > 0 && (
            <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", padding: "3px 8px", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#ef4444", letterSpacing: "0.12em" }}>
              {criticalCount} CRITICAL
            </div>
          )}
          {warningCount > 0 && (
            <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", padding: "3px 8px", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#f59e0b", letterSpacing: "0.12em" }}>
              {warningCount} WARNING
            </div>
          )}
        </div>

        {/* Clock + live */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: 16 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", animation: "pulse 1.4s infinite" }} />
          <span style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.1em" }}>LIVE</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{time.toISOString().slice(11, 19)} UTC</span>
        </div>
      </div>

      {/* TICKER */}
      <div style={{
        height: 28, flexShrink: 0, overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "#07090c",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker 28s linear infinite" }}>
          {[...Array(2)].map((_, ri) =>
            STATIONS.map((s, i) => (
              <span key={`${ri}-${i}`} style={{ fontSize: 9, color: severityColor(s.status), letterSpacing: "0.1em", padding: "0 24px", opacity: 0.7 }}>
                PM2.5 · {s.name} · {s.pm25.toFixed(1)} µg/m³ · {s.status}
                <span style={{ color: "rgba(255,255,255,0.15)", padding: "0 8px" }}>———</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>

        {/* LEFT SIDEBAR */}
        <div style={{
          width: 260, flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Metrics */}
          <div style={{ padding: "12px 12px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <MetricCard label="AVG PM2.5" value={avgPm25} unit="µg/m³" color={pm25Color(Number(avgPm25))} spark={sparkPm25} />
            <MetricCard label="PEAK AQI" value="148" unit="AQI" color="#ef4444" spark={sparkAqi} />
            <MetricCard label="NO₂" value="28.4" unit="ppb" color="#f59e0b" spark={sparkNo2} />
            <MetricCard label="MAX Z-SCORE" value={maxZscore} unit="σ" color="#ef4444" sub="ANOMALY" />
          </div>

          {/* Separator */}
          <div style={{ margin: "12px 0 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

          {/* Alert feed header */}
          <div style={{ padding: "10px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}>STATION FEED</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{STATIONS.length} ACTIVE</div>
          </div>

          {/* Alert list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {STATIONS.sort((a, b) => b.pm25 - a.pm25).map(st => (
              <AlertRow key={st.id} station={st} onClick={setSelectedStation} active={selectedStation?.id === st.id} />
            ))}
          </div>

          {/* System status */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", animation: "pulse 2.5s infinite" }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em" }}>SYSTEM OPERATIONAL</span>
          </div>
        </div>

        {/* MAP PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Map header */}
          <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}>
              HYDERABAD AIRSHEED · GAUSSIAN PLUME DISPERSION · PASQUILL CLASS D
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[["4 SRC", "rgba(255,255,255,0.3)"], ["4 ZONES", "rgba(239,68,68,0.6)"], [`${STATIONS.length} STN`, "rgba(255,255,255,0.3)"]].map(([v, c]) => (
                <span key={v} style={{ fontSize: 9, color: c, letterSpacing: "0.1em" }}>{v}</span>
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <MapPanel selectedStation={selectedStation} onSelectStation={setSelectedStation} />
          </div>

          {/* Bar chart below map */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <div style={{ padding: "8px 16px 4px", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}>PM2.5 BY STATION</div>
            <MiniBarChart stations={STATIONS} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          width: 256, flexShrink: 0,
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}>CHAIN OF EVIDENCE</div>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <ForensicPanel station={selectedStation} />
          </div>

          {/* Enforcement action */}
          {selectedStation?.status === "CRITICAL" && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px", flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 8 }}>ENFORCEMENT</div>
              <button style={{
                width: "100%", background: "#ef4444", border: "none", color: "#000",
                fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em",
                padding: "9px 0", cursor: "pointer",
              }}>DISPATCH INSPECTION TEAM</button>
              <button style={{
                width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)",
                fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.14em",
                padding: "8px 0", cursor: "pointer", marginTop: 6,
              }}>EXPORT PDF REPORT</button>
            </div>
          )}

          {/* Source breakdown */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px", flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 8 }}>DATA SOURCES</div>
            {[["OpenAQ V3", "LIVE", "#10b981"], ["PurpleAir", "LIVE", "#10b981"], ["CPCB India", "MOCK", "#f59e0b"], ["SAFAR", "MOCK", "#f59e0b"]].map(([src, status, color]) => (
              <div key={src} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{src}</span>
                <span style={{ fontSize: 9, color, letterSpacing: "0.08em" }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
