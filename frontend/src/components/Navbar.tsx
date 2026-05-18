'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <nav className="fixed inset-x-0 top-0 z-50" style={{ borderBottom: '1px solid var(--border-primary)', background: isHome ? 'transparent' : 'var(--bg-secondary)', backdropFilter: 'blur(12px)' }}>
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-3 no-underline" style={{ color: 'var(--text-primary)' }}>
                    <span className="status-dot h-[9px] w-[9px] bg-emerald-500" />
                    <span className="font-heading text-[1rem] font-bold tracking-[0.22em]">ECO-SENTINEL</span>
                </Link>

                <div className="flex items-center gap-6 text-[0.7rem] uppercase tracking-[0.24em]" style={{ color: 'var(--text-secondary)' }}>
                    <Link href="/about" className="nav-link transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        About
                    </Link>
                    <Link href="/dashboard" className="nav-link transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        Dashboard
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
