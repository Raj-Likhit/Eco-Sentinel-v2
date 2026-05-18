'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MOCK_ALERTS } from '../data/mockAlerts';

export default function Breadcrumbs() {
    const searchParams = useSearchParams();
    const focusId = searchParams.get('focus_id');

    const activeAlert = focusId ? MOCK_ALERTS.find(a => a.id === focusId) : null;

    return (
        <nav className="flex items-center text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-slate-600">/</span>
            <Link href="/dashboard" className={`hover:text-white transition-colors ${!activeAlert ? 'text-white font-medium' : ''}`}>
                Dashboard
            </Link>
            {activeAlert && (
                <>
                    <span className="mx-2 text-slate-600">/</span>
                    <span className="text-white font-medium flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeAlert.severity === 'CRITICAL' ? 'bg-accent-red' :
                                activeAlert.severity === 'MODERATE' ? 'bg-accent-amber' : 'bg-accent-green'
                            }`}></span>
                        {activeAlert.location}
                    </span>
                </>
            )}
        </nav>
    );
}
