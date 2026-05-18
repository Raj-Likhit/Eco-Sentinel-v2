'use client';

import type { Metadata } from 'next';
import Link from 'next/link';

export default function About() {
    return (
        <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Hero */}
            <section className="relative pt-32 pb-24 px-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="gradient-mesh" />
                <div className="relative z-10 max-w-6xl mx-auto">
                    <h1 className="text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>About Eco-Sentinel</h1>
                    <p className="text-xl max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                        AI-powered environmental forensics that transforms pollution detection into enforcement action.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Our mission</h2>
                            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                                Environmental monitoring has been reactive for decades. Authorities see pollution spikes on dashboards but don't know who caused them.
                            </p>
                            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                                Eco-Sentinel changes that. We combine real-time sensor data, satellite imagery, and AI reasoning to identify pollution sources within minutes.
                            </p>
                        </div>
                        <div className="card p-12 text-center">
                            <div className="text-6xl font-bold mb-4" style={{ color: 'var(--accent-green)' }}>99%</div>
                            <p style={{ color: 'var(--text-secondary)' }}>Detection Accuracy</p>
                            <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border-card)' }}>
                                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--accent-green)' }}>&lt;5 min</div>
                                <p style={{ color: 'var(--text-secondary)' }}>Response Time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Challenge */}
            <section className="py-24 px-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-16 text-center" style={{ color: 'var(--text-primary)' }}>The challenge</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="card p-8" style={{ borderColor: 'var(--accent-red)' }}>
                            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Traditional approach</h3>
                            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                                <li>• Passive monitoring only</li>
                                <li>• No source attribution</li>
                                <li>• Enforcement agencies act blind</li>
                                <li>• Pollution spreads while investigating</li>
                            </ul>
                        </div>

                        <div className="card p-8" style={{ borderColor: 'var(--accent-green)' }}>
                            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Eco-Sentinel approach</h3>
                            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                                <li>• Real-time forensic analysis</li>
                                <li>• Identifies exact pollution source</li>
                                <li>• Actionable intelligence for enforcement</li>
                                <li>• Minutes to action, not months</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-16 text-center" style={{ color: 'var(--text-primary)' }}>The forensic pipeline</h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { num: '1', title: 'Detect', desc: 'Real-time sensors detect PM2.5 anomalies' },
                            { num: '2', title: 'Trace', desc: 'Wind trajectory calculates upwind path' },
                            { num: '3', title: 'Analyze', desc: 'Satellite imagery confirms emissions' },
                            { num: '4', title: 'Identify', desc: 'AI synthesizes evidence for verdict' }
                        ].map((step, i) => (
                            <div key={i} className="card p-8">
                                <div className="text-4xl font-bold mb-4" style={{ color: 'var(--accent-green)' }}>{step.num}</div>
                                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section className="py-24 px-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-16 text-center" style={{ color: 'var(--text-primary)' }}>Built with cutting-edge tech</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'AI & Reasoning', items: ['Gemini 2.5-Flash', 'Multi-step reasoning', 'Chain-of-evidence synthesis'] },
                            { title: 'Data Sources', items: ['OpenAQ V3', 'CPCB India', 'PurpleAir', 'SAFAR'] },
                            { title: 'Satellite & Geospatial', items: ['Sentinel-5P', 'Google Earth Engine', 'Wind Trajectory', 'Gaussian Plume'] }
                        ].map((tech, i) => (
                            <div key={i} className="card p-8">
                                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{tech.title}</h3>
                                <ul className="space-y-3">
                                    {tech.items.map((item, j) => (
                                        <li key={j} className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }}></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Ready to take action?</h2>
                    <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                        Join enforcement agencies worldwide using Eco-Sentinel to combat industrial pollution.
                    </p>
                    <Link href="/dashboard" className="btn btn-primary">
                        Launch Dashboard
                    </Link>
                </div>
            </section>
        </main>
    );
}
