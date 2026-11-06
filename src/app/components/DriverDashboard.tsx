import { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  Play,
  Square,
  Navigation,
  Clock,
  Users,
  CheckCircle2,
  Phone,
  AlertTriangle,
  QrCode,
  Gauge,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import Logo from './Logo';
import RealLeafletMap from './RealLeafletMap';
import { busStore, BusRoute } from '../services/busData';

interface DriverDashboardProps {
  userInfo: {
    routeId?: string;
    routeNumber?: string;
    routeName?: string;
    driverName?: string;
    phone?: string;
    busNumber?: string;
  };
  onLogout: () => void;
}

export default function DriverDashboard({ userInfo, onLogout }: DriverDashboardProps) {
  const [routes, setRoutes] = useState<BusRoute[]>(() => busStore.getRoutes());
  const initialRouteId = userInfo.routeId || routes[0]?.id || 'route-1';
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId);
  const [showQRModal, setShowQRModal] = useState(false);
  const [tripSeconds, setTripSeconds] = useState(0);

  const route = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const isOnTrip = route.status === 'active';

  // Subscribe to store updates
  useEffect(() => {
    const unsub = busStore.subscribe(() => {
      setRoutes(busStore.getRoutes());
    });
    return unsub;
  }, []);

  // Timer loop for active trip duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isOnTrip) {
      timer = setInterval(() => {
        setTripSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOnTrip]);

  const watchIdRef = useRef<number | null>(null);

  const handleStartTrip = () => {
    busStore.startTrip(route.id, userInfo.driverName, userInfo.phone);
    setTripSeconds(0);
    toast.success(`Trip started for ${route.routeNumber} (${route.busNumber})`);

    // Broadcast real device phone GPS (no simulation)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
          const hdg = pos.coords.heading || 0;
          busStore.updateBusLocation(route.id, [lat, lng], spd, hdg);
        },
        (err) => {
          toast.error(`GPS Error: ${err.message}. Please allow location access for real-time tracking.`);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
          const hdg = pos.coords.heading || 0;
          busStore.updateBusLocation(route.id, [lat, lng], spd, hdg);
        },
        (err) => {
          console.warn('Real-time GPS watch warning:', err);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
      );
    } else {
      toast.error('Geolocation is not supported by your device.');
    }
  };

  const handleStopTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    busStore.stopTrip(route.id);
    toast.info(`Trip concluded for ${route.routeNumber}. Telemetry stopped.`);
  };

  const handleAdvanceStop = () => {
    const currentRoutes = busStore.getRoutes();
    const idx = currentRoutes.findIndex((r) => r.id === route.id);
    if (idx !== -1) {
      const stops = [...currentRoutes[idx].stops];
      const nextUnpassed = stops.findIndex((s) => !s.passed);
      if (nextUnpassed !== -1) {
        stops[nextUnpassed].passed = true;
        currentRoutes[idx].stops = stops;
        const upcoming = stops.find((s) => !s.passed);
        if (upcoming) {
          currentRoutes[idx].nextStop = upcoming.name;
          currentRoutes[idx].etaMinutes = Math.max(5, currentRoutes[idx].etaMinutes - 8);
        } else {
          currentRoutes[idx].nextStop = 'PEC Campus Gate';
          currentRoutes[idx].etaMinutes = 3;
        }
        busStore.saveRoutes(currentRoutes);
        toast.success(`Stop marked as completed: ${stops[nextUnpassed].name}`);
      } else {
        toast.info('All scheduled stops along this route have been completed.');
      }
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* Driver Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Driver Duty Console
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {route.routeNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Driver: <span className="font-semibold text-slate-800">{route.driver.name}</span> • Vehicle: <span className="font-mono font-bold text-maroon-700">{route.busNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-white focus:ring-2 focus:ring-maroon-700/20 max-w-[220px] truncate"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeNumber} – {r.routeName} ({r.busNumber})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Show Driver QR Duty Pass"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Duty Pass</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Trip Control Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOnTrip ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
                  }`}
                />
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {route.routeName}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isOnTrip
                  ? 'Trip is ACTIVE. Live GPS broadcast is transmitting to students and fleet admin.'
                  : 'Trip is NOT STARTED. Click "Start Trip" when ready to depart initial boarding point.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              {!isOnTrip ? (
                <button
                  type="button"
                  onClick={handleStartTrip}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Morning / Evening Trip</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAdvanceStop}
                    className="flex-1 sm:flex-initial px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Next Stop Reached</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopTrip}
                    className="flex-1 sm:flex-initial px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Conclude Trip</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Trip Duration</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                {isOnTrip ? formatDuration(tripSeconds) : '00:00'}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Current Speed</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {isOnTrip ? `${route.speedKmH} km/h` : '0 km/h'}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Passenger Load</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {route.occupancy} <span className="text-xs font-normal text-slate-400">/ {route.capacity} seats</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Navigation className="w-4 h-4 text-maroon-700" />
                <span className="font-semibold">Next Designated Stop</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {route.nextStop}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive View (Map & Stops List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Interactive Route Map */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Live Navigation & Route Map
                </h3>
                <p className="text-xs text-slate-500">
                  Transmitting GPS updates along Chennai-Tiruvallur Road corridor
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                GPS: {route.currentLocation[0].toFixed(4)}° N, {route.currentLocation[1].toFixed(4)}° E
              </span>
            </div>

            <div className="h-[360px] sm:h-[460px] w-full rounded-2xl overflow-hidden">
              <RealLeafletMap
                routes={routes}
                selectedRouteId={route.id}
                height="100%"
              />
            </div>
          </div>

          {/* Stops Checklist & Schedule */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-maroon-700" />
                <span>Duty Stops Checklist</span>
              </h3>

              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {route.stops.map((stop, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                      stop.passed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          stop.passed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {stop.passed ? '✓' : index + 1}
                      </span>
                      <div>
                        <div className="font-bold">{stop.name}</div>
                        <div className="text-[11px] text-slate-500">Scheduled: {stop.time}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        stop.passed
                          ? 'bg-emerald-200/80 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {stop.passed ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Desk */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Dispatcher Support</span>
              </div>
              <p className="text-xs text-slate-300">
                In case of heavy traffic delays, route diversions, or vehicle breakdown, notify PEC dispatch immediately.
              </p>
              <a
                href="tel:+914427628000"
                className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Transport Officer</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Driver QR Pass Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-scale-up text-center">
            <h3 className="text-lg font-extrabold text-slate-900">Driver Duty Pass</h3>
            <p className="text-xs text-slate-500 mt-1">
              Prathyusha Engineering College Transport Division
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl my-4 flex justify-center">
              <QRCodeSVG
                value={`PEC-TRANS-DUTY-${route.routeNumber}-${route.busNumber}-${route.driver.name}`}
                size={180}
              />
            </div>

            <div className="text-xs text-slate-700 space-y-1 mb-5">
              <div><b>Driver:</b> {route.driver.name}</div>
              <div><b>Route:</b> {route.routeNumber} ({route.busNumber})</div>
              <div><b>License:</b> {route.driver.license}</div>
            </div>

            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-black transition-colors"
            >
              Close Duty Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}