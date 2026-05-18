'use client';

import Link from 'next/link';
import Image from 'next/image';

const tickerItems = [
  'PM2.5 · IDA PASHAMYLARAM · 148.3 ug/m3 · CRITICAL',
  'NO2 · SANATHNAGAR CAAQMS · 64.1 ppb · WARNING',
  'TRACE VECTOR · CHERLAPALLY INDUSTRIAL CLUSTER · 0.91 CONFIDENCE · LOCKED',
  'UPWIND MATCH · PATANCHERU CORRIDOR · 18.4 KM · VERIFIED',
];

const loopSteps = [
  {
    num: '01',
    title: 'DETECT',
    desc: 'Sensor mesh flags deviations before the plume turns into a public incident.',
  },
  {
    num: '02',
    title: 'TRACE',
    desc: 'Trajectory logic pulls the signal upwind and isolates likely industrial corridors.',
  },
  {
    num: '03',
    title: 'VERIFY',
    desc: 'Satellite context and historical station behavior harden the evidence chain.',
  },
  {
    num: '04',
    title: 'ENFORCE',
    desc: 'Operators receive a clean action packet built for escalation and intervention.',
  },
];

const interventions = [
  '[18:42:11]  IDA-PASHAMYLARAM      0.94      CRITICAL',
  '[18:37:54]  SANATHNAGAR-BELT      0.81      INVESTIGATING',
  '[18:26:03]  CHERLAPALLY-CLUSTER   0.77      WARNING',
  '[18:11:47]  PATANCHERU-CORRIDOR   0.69      MONITORING',
  '[17:58:20]  ZOO-PERIMETER         0.32      CLEARED',
];

export default function Home() {
  const repeatedTicker = [...tickerItems, ...tickerItems];

  return (
    <main className="hero-crosshair min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]">
          <div className="relative h-full w-full max-w-[2560px]">
            <Image
              src="/images/hero-satellite-texture.webp"
              alt=""
              width={1920}
              height={1080}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_84%,rgba(16,185,129,0.03),transparent_28%)]" />
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[35%] lg:block">
          <div className="relative h-full w-full">
            <Image
              src="/images/plume-dispersion-model.png"
              alt=""
              fill
              className="plume-fade-mask object-contain object-right opacity-40"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center pt-12 text-center">
          <p className="fade-in-up font-data text-[11px] uppercase tracking-[0.2em]" style={{ animationDelay: '0.1s', color: 'var(--text-tertiary)' }}>
            Environmental AI Enforcement Platform
          </p>

          <h1 className="fade-in-up mt-8 max-w-5xl font-heading text-[4.5rem] font-bold uppercase leading-[0.92] tracking-[-0.04em] md:text-[6rem]" style={{ animationDelay: '0.2s', color: 'var(--text-primary)' }}>
            Detect. Trace.
            <br />
            Shut It Down.
          </h1>

          <p className="fade-in-up mt-8 max-w-[60ch] font-body text-base md:text-lg" style={{ animationDelay: '0.3s', color: 'var(--text-secondary)' }}>
            Real-time forensic telemetry for environmental enforcement teams tracking industrial emissions at source.
          </p>

          <div className="fade-in-up mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.4s' }}>
            <Link href="/dashboard" className="btn btn-primary px-8 py-3 font-body text-sm font-semibold uppercase tracking-[0.14em]">
              Enter Command Surface
            </Link>
            <Link href="/about" className="btn btn-secondary px-8 py-3 font-body text-sm font-semibold uppercase tracking-[0.14em]">
              Review Capability
            </Link>
          </div>

          <div className="mt-14 w-full overflow-hidden py-3" style={{ borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
            <div className="ticker-track">
              {repeatedTicker.map((item, index) => (
                <div key={`${item}-${index}`} className="flex shrink-0 items-center whitespace-nowrap pr-12 font-data text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{item}</span>
                  <span className="px-6" style={{ color: 'var(--text-muted)' }}>------</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.06] px-6 py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <Image
            src="/images/sensor-network-topology.png"
            alt=""
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between gap-8">
            <div>
              <p className="font-data text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Operational Sequence</p>
              <h2 className="mt-4 font-heading text-4xl uppercase" style={{ color: 'var(--text-primary)' }}>The Forensics Loop</h2>
            </div>
          </div>

          <div className="relative grid gap-0 border-t border-white/[0.06] md:grid-cols-4">
            <div className="pointer-events-none absolute left-0 right-0 top-0 hidden h-px bg-white/[0.06] md:block" />
            {loopSteps.map((step) => (
              <div
                key={step.num}
                className="group border-b border-white/[0.06] px-0 py-0 md:border-b-0 md:border-r md:border-white/[0.06]"
              >
                <div className="loop-step-card border-l-2 border-transparent px-5 py-8 transition-all duration-300 group-hover:border-l-emerald-500">
                  <div className="font-data text-[12px] tracking-[0.2em] transition-all duration-300 group-hover:text-emerald-500 group-hover:tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
                    {step.num}
                  </div>
                  <h3 className="mt-4 font-heading text-xl uppercase transition-colors duration-300 group-hover:text-emerald-400" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="mt-4 max-w-[26ch] font-body text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="relative overflow-hidden border border-white/[0.08] terminal-perspective">
              <Image
                src="/images/terminal-log-interface.webp"
                alt="Terminal interface"
                width={1600}
                height={900}
                className="w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-transparent to-transparent opacity-40" />
            </div>

            <div>
              <p className="font-data text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Field Activity</p>
              <h2 className="mt-4 font-heading text-4xl uppercase" style={{ color: 'var(--text-primary)' }}>Recent Interventions</h2>

              <div className="mt-10" style={{ border: '1px solid var(--border-card)', background: 'var(--bg-secondary)' }}>
            {interventions.map((row, index) => (
              <div
                key={row}
                className="px-5 py-4 font-data text-[12px] uppercase tracking-[0.18em]"
                style={{ 
                  borderBottom: '1px solid var(--border-card)', 
                  color: 'var(--text-secondary)',
                  background: index % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                }}
              >
                {row}
              </div>
            ))}
            <div className="flex items-center gap-2 px-5 py-4 font-data text-[12px] uppercase tracking-[0.18em] text-emerald-500">
              <span style={{ color: 'var(--text-tertiary)' }}>Awaiting next incident packet</span>
              <span className="log-cursor">█</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
