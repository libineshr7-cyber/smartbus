import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import LoginPage from './components/LoginPage';
import DriverDashboard from './components/DriverDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import BusQrTripStarter from './components/BusQrTripStarter';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'driver' | 'student' | 'admin' | 'qr_trip'>('login');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [qrRouteId, setQrRouteId] = useState<string | undefined>(undefined);

  // Check URL params for direct physical QR code scan (?bus_qr=RNo:12)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const busQrParam = searchParams.get('bus_qr');
      if (busQrParam) {
        setQrRouteId(busQrParam);
        setCurrentView('qr_trip');
      }
    }
  }, []);

  const handleLogin = (role: 'driver' | 'student' | 'admin', info: any) => {
    setUserInfo(info);
    setCurrentView(role);
  };

  const handleLogout = () => {
    setUserInfo(null);
    setCurrentView('login');
  };

  const handleOpenQrTrip = (routeId?: string) => {
    setQrRouteId(routeId);
    setCurrentView('qr_trip');
  };

  return (
    <div className="size-full">
      <Toaster position="top-right" richColors />
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} onOpenQrTrip={handleOpenQrTrip} />
      )}
      {currentView === 'driver' && <DriverDashboard userInfo={userInfo} onLogout={handleLogout} />}
      {currentView === 'student' && <StudentDashboard userInfo={userInfo} onLogout={handleLogout} />}
      {currentView === 'admin' && <AdminDashboard userInfo={userInfo} onLogout={handleLogout} />}
      {currentView === 'qr_trip' && (
        <BusQrTripStarter
          initialRouteId={qrRouteId}
          onClose={() => setCurrentView('login')}
          onTripStarted={(routeId) => {
            // Keep running in dispatcher mode while GPS broadcasts
          }}
        />
      )}
    </div>
  );
}

