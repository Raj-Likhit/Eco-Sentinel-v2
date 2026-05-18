import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="pt-16 pb-8" style={{ borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-8 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: 'var(--text-primary)' }}>shield</span>
                    </div>
                    <span className="text-lg font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>ECO-SENTINEL</span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <Link className="hover:text-accent-green transition-colors" href="/privacy-policy">Privacy Policy</Link>
                    <Link className="hover:text-accent-green transition-colors" href="/terms-of-service">Terms of Service</Link>
                    <Link className="hover:text-accent-green transition-colors" href="#">API Documentation</Link>
                    <Link className="hover:text-accent-green transition-colors flex items-center gap-1" href="#">
                        GitHub Repo
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </Link>
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    © 2025 Eco-Sentinel Defense Systems. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
