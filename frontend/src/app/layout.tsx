import './globals.css';
import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'sonner';
import ErrorBoundary from '../components/ErrorBoundary';
import { GlobalProvider } from '../context/GlobalContext';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'Eco-Sentinel',
  description: 'AI Environmental Forensics Agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="overflow-x-hidden selection:bg-accent-green selection:text-black">
        <ErrorBoundary>
          <ThemeProvider>
            <GlobalProvider>
              <Navbar />
              <div className="pt-20">
                {children}
              </div>
              <Footer />
              <Toaster position="top-right" />
            </GlobalProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
