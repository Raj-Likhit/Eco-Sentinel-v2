import dynamic from 'next/dynamic';
import DashboardLoader from '../../components/dashboard/DashboardLoader';
import { ThemeProvider } from '../../context/ThemeContext';

const PremiumDashboard = dynamic(() => import('../../components/PremiumDashboard'), {
  ssr: false,
  loading: () => <DashboardLoader />
});

export default function Page() {
  return (
    <ThemeProvider>
      <PremiumDashboard />
    </ThemeProvider>
  );
}
