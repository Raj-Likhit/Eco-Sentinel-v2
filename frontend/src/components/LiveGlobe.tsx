'use client';

import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useGlobal } from '../context/GlobalContext';

export default function LiveGlobe() {
    const { pinnedCities } = useGlobal();
    const globeEl = useRef<any>();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;

            const bounds = containerRef.current.getBoundingClientRect();
            setDimensions({
                width: Math.max(Math.floor(bounds.width), 320),
                height: Math.max(Math.floor(bounds.height), 420)
            });
        };

        handleResize();

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!globeEl.current) return;

        globeEl.current.controls().autoRotate = hoveredId === null;
        globeEl.current.controls().autoRotateSpeed = 0.5;
        globeEl.current.controls().enablePan = false;
        globeEl.current.pointOfView({ altitude: 2.4 }, 0);
    }, [dimensions, hoveredId, pinnedCities]);

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,#12314d_0%,#07111b_24%,#02050a_68%)]"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_80%_12%,rgba(34,197,94,0.14),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />

            <div className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Session Pins</span>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-all ${i < pinnedCities.length ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-800'}`}
                            />
                        ))}
                    </div>
                    <span className="font-mono text-sm text-white">{pinnedCities.length}/5</span>
                </div>
            </div>

            {dimensions.width > 0 && dimensions.height > 0 ? (
                <Globe
                    ref={globeEl}
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                    atmosphereColor="#38bdf8"
                    atmosphereAltitude={0.18}
                    htmlElementsData={pinnedCities}
                    htmlLat="lat"
                    htmlLng="lng"
                    htmlAltitude={0.05}
                    htmlElement={(d: any) => {
                        const alert = d;
                        const isHovered = hoveredId === alert.id;
                        const colorMap: Record<string, string> = {
                            CRITICAL: '#fb7185',
                            WARNING: '#f59e0b',
                            NORMAL: '#34d399'
                        };
                        const color = colorMap[alert.severity] || colorMap.NORMAL;

                        const el = document.createElement('button');
                        el.type = 'button';
                        el.className = 'group pointer-events-auto relative flex -translate-x-1/2 -translate-y-full cursor-pointer flex-col items-center bg-transparent p-0';
                        el.innerHTML = `
                            <div class="relative flex flex-col items-center transition-transform duration-300 ${isHovered ? 'scale-110' : ''}">
                                <div class="rounded-full border border-white/60 shadow-[0_0_22px_rgba(255,255,255,0.22)]" style="width:12px;height:12px;background:${color};"></div>
                                <div style="width:1px;height:34px;background:linear-gradient(180deg, ${color}, rgba(255,255,255,0));"></div>
                                ${isHovered ? `
                                    <div class="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-left shadow-2xl backdrop-blur-xl">
                                        <div class="text-xs font-bold uppercase tracking-[0.18em] text-white">${alert.location}</div>
                                        <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-300">
                                            <span class="inline-block h-2 w-2 rounded-full" style="background:${color};"></span>
                                            <span>${alert.severity}</span>
                                            <span class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white">${alert.pm25} ug/m3</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                        el.onmouseenter = () => setHoveredId(alert.id);
                        el.onmouseleave = () => setHoveredId(null);
                        return el;
                    }}
                    htmlTransitionDuration={200}
                />
            ) : null}
        </div>
    );
}
