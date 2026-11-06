import { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  MapPin,
  Clock,
  Navigation,
  AlertCircle,
  Phone,
  ShieldAlert,
  ChevronRight,
  Bus,
  CheckCircle2,
  Bell,
  RefreshCw,
  Users,
  Compass,
  Crosshair,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';
import RapidoGoogleMap from './RapidoGoogleMap';
import { busStore, BusRoute, Announcement, SOSAlert, BusStop } from '../services/busData';
import { getDistanceMeters } from '../services/routeSimulation';

interface StudentDashboardProps {
  userInfo: {
    registerNumber: string;
    name?: string;
    department?: string;
    routeId?: string;
    routeName?: string;
    routeNumber?: string;
    pickupStop?: string;
  };
  onLogout: () => void;
}

export default function StudentDashboard({ userInfo, onLogout }: StudentDashboardProps) {
  const [routes, setRoutes] = useState<BusRoute[]>(() => busStore.getRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    userInfo.routeId || routes[0]?.id || 'RNo:12'
  );

  const [followBus, setFollowBus] = useState(true);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'route' | 'driver'>('map');

  // Real-time device geolocation states
  const [studentLocation, setStudentLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const broadcastWatchIdRef = useRef<number | null>(null);

  // Subscribe to central bus store for real-time live telemetry from Driver GPS broadcast
  useEffect(() => {
    const unsub = busStore.subscribe(() => {
      setRoutes(busStore.getRoutes());
    });
    return unsub;
  }, []);

  const route = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const [selectedStopName, setSelectedStopName] = useState<string>(
    userInfo.pickupStop || route.stops[1]?.name || route.stops[0]?.name || ''
  );

  // Student designated pickup stop
  const studentStop =
    route.stops.find((s) => s.name.toLowerCase() === selectedStopName.toLowerCase()) ||
    route.stops.find((s) => s.name.toLowerCase().includes((userInfo.pickupStop || '').toLowerCase())) ||
    route.stops[1] ||
    route.stops[0];

  // Stop progression calculation based on passed stops
  const totalStops = route.stops.length;
  const passedStops = route.stops.filter((s) => s.passed).length;
  const progressPercent = totalStops > 0 ? Math.round((passedStops / totalStops) * 100) : 0;

  // REAL-TIME BUS TELEMETRY (Directly from live device GPS broadcast)
  const currentLoc: [number, number] = route.currentLocation || (route.stops[0]?.location || [13.1332, 79.9725]);
  const busPosition = {
    lat: currentLoc[0],
    lng: currentLoc[1],
    bearing: route.heading || 0,
    speedKmH: route.status === 'active' ? (route.speedKmH || 0) : 0,
    progressPercent,
    distanceToDestKm: 0,
    etaMinutes: route.etaMinutes || 0
  };

  // Update stop passed status dynamically based on current real-time bus location
  useEffect(() => {
    route.stops.forEach((stop) => {
      const distToStop = getDistanceMeters(currentLoc[0], currentLoc[1], stop.location[0], stop.location[1]);
      if (distToStop < 300 && !stop.passed) {
        stop.passed = true;
      }
    });
  }, [currentLoc, route]);

  // Distance from bus to student's designated stop
  const distToStudentMeters = studentStop
    ? getDistanceMeters(
        busPosition.lat,
        busPosition.lng,
        studentStop.location[0],
        studentStop.location[1]
      )
    : 0;

  const distToStudentKm = Number((distToStudentMeters / 1000).toFixed(1));
  const etaToStudentMins = Math.max(1, Math.round((distToStudentKm / (busPosition.speedKmH || 40)) * 60));

  // Acquire current student/device real satellite location
  const handleLocateStudent = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setStudentLocation(coords);
        toast.success(`Device GPS located: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
      },
      (err) => {
        setIsLocating(false);
        toast.error(`GPS Error: ${err.message}. Please enable location permissions.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Broadcast device GPS to bus in real time (for testing or direct mobile driving)
  const toggleGpsBroadcast = () => {
    if (isBroadcastingGps) {
      if (broadcastWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(broadcastWatchIdRef.current);
        broadcastWatchIdRef.current = null;
      }
      setIsBroadcastingGps(false);
      toast.info(`Stopped broadcasting GPS to ${route.routeNumber}`);
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your device.');
      return;
    }

    toast.loading(`Acquiring satellite GPS for ${route.routeNumber}...`, { id: 'device-gps' });
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speedKmh = pos.coords.speed != null && pos.coords.speed > 0
          ? Math.round(pos.coords.speed * 3.6)
          : 0;
        const heading = pos.coords.heading ?? 0;

        busStore.updateBusLocation(route.id, [lat, lng], speedKmh, heading);
        setStudentLocation([lat, lng]);
        toast.success(`Transmitting Real Satellite GPS: ${speedKmh} km/h • ${lat.toFixed(4)}, ${lng.toFixed(4)}`, {
          id: 'device-gps'
        });
      },
      (err) => {
        toast.error(`GPS Error: ${err.message}. Please allow location permission.`, { id: 'device-gps' });
        setIsBroadcastingGps(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );

    broadcastWatchIdRef.current = watchId;
    setIsBroadcastingGps(true);
  };

  useEffect(() => {
    return () => {
      if (broadcastWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(broadcastWatchIdRef.current);
      }
    };
  }, []);

  const handleConfirmSOS = () => {
    busStore.triggerSOS({
      studentId: userInfo.registerNumber,
      studentName: userInfo.name || 'PEC Student',
      department: userInfo.department || 'B.E. Computer Science',
      year: 'Final Year',
      phone: '+91 98400 12345',
      routeId: route.id,
      location: [busPosition.lat, busPosition.lng],
      locationName: `Near ${route.nextStop} (Route: ${route.routeNumber})`,
      message: `Emergency SOS from student ${userInfo.name} aboard/waiting for ${route.routeNumber}`
    });

    setShowSOSModal(false);
    toast.error('Emergency SOS dispatched to PEC Transport Admin Desk with your GPS location.', {
      duration: 6000
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar - Auto-fitting & Responsive */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Brand & User Info */}
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  PEC SmartBus
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-maroon-50 text-maroon-800 border border-maroon-200">
                  {userInfo.registerNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-none">
                {userInfo.name || 'Student'} • Stop: <span className="font-bold text-slate-700">{studentStop?.name}</span>
              </p>
            </div>
          </div>

          {/* Quick Route Selector + Real-Time GPS Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Route Dropdown */}
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-white focus:ring-2 focus:ring-maroon-700/20"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeNumber} – {r.routeName} ({r.busNumber})
                </option>
              ))}
            </select>

            {/* Locate Me Button */}
            <button
              type="button"
              onClick={handleLocateStudent}
              disabled={isLocating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all active:scale-95"
              title="Locate my real device GPS on the map"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
            </button>

            {/* Broadcast My GPS Toggle */}
            <button
              type="button"
              onClick={toggleGpsBroadcast}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isBroadcastingGps
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'border border-slate-300 bg-slate-50 hover:bg-white text-slate-700'
              }`}
              title="Stream this phone/laptop's real GPS directly to this bus in real time"
            >
              <span className={`w-2 h-2 rounded-full ${isBroadcastingGps ? 'bg-white animate-ping' : 'bg-emerald-500'}`} />
              <span className="hidden md:inline">{isBroadcastingGps ? 'Broadcasting Device GPS' : 'Broadcast My GPS to Bus'}</span>
              <span className="md:hidden">{isBroadcastingGps ? 'Broadcasting' : 'Broadcast GPS'}</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setShowSOSModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              <AlertCircle className="w-4 h-4 animate-bounce" />
              <span>SOS</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5 border border-slate-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Mobile View Switcher (Tabs) */}
        <div className="flex lg:hidden bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 text-center rounded-xl transition-all ${
              activeTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : ''
            }`}
          >
            Live Tracking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`flex-1 py-2 text-center rounded-xl transition-all ${
              activeTab === 'route' ? 'bg-white text-slate-900 shadow-sm' : ''
            }`}
          >
            Route Stops ({route.stops.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`flex-1 py-2 text-center rounded-xl transition-all ${
              activeTab === 'driver' ? 'bg-white text-slate-900 shadow-sm' : ''
            }`}
          >
            Driver Details
          </button>
        </div>

        {/* 2-Column Responsive Layout (Uber/Rapido style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left/Center Column: Google Map with Continuous Movement */}
          <div
            className={`lg:col-span-8 flex flex-col space-y-4 ${
              activeTab !== 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Live Rapido/Ola Status Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-xl shrink-0">
                  🚌
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {route.routeNumber}: {route.routeName}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      route.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      ● {route.status === 'active' ? 'LIVE GPS ACTIVE' : 'SCHEDULED (AWAITING DRIVER)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vehicle: <span className="font-mono font-bold text-slate-800">{route.busNumber}</span> • Driver: <span className="font-semibold text-slate-700">{route.driver.name}</span>
                  </p>
                </div>
              </div>

              {/* Real-Time GPS Telemetry Indicator */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-950 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${route.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${route.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                </span>
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-800">
                  {route.status === 'active' ? 'Real-Time GPS' : 'Scheduled'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-emerald-700 font-black">
                  {route.status === 'active' ? `${route.speedKmH || 0} km/h` : '0 km/h'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {route.lastUpdated || 'Live'}
                </span>
              </div>
            </div>

            {/* Google Map View with Continuous 60fps Gliding Bus */}
            <div className="h-[380px] sm:h-[480px] lg:h-[540px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <RapidoGoogleMap
                route={route}
                busPosition={busPosition}
                studentStop={studentStop}
                studentLocation={studentLocation}
                followBus={followBus}
                onToggleFollow={setFollowBus}
                height="100%"
              />
            </div>

            {/* Ola / Rapido Trip Progress Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-maroon-700" />
                  <span>Route Progress: {progressPercent}% Completed ({passedStops}/{totalStops} Stops)</span>
                </span>
                <span className="font-mono text-emerald-600 font-bold">
                  {route.status === 'active' ? `${route.speedKmH || 0} km/h • Real-Time GPS` : 'Stationary (0 km/h)'}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-maroon-700 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Start: {route.stops[0]?.name}</span>
                <span className="font-bold text-blue-600">Your Stop: {studentStop?.name}</span>
                <span>Destination: PEC Campus</span>
              </div>
            </div>
          </div>

          {/* Right Column: Rapido/Ola Style Ride Card & Stops Itinerary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Journey ETA Card (Ola / Uber Style) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-5 shadow-xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Approaching Your Stop</span>
                </span>
                <span className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-slate-200">
                  {route.routeNumber}
                </span>
              </div>

              {/* Huge ETA Display */}
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  ~ {etaToStudentMins} mins
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span>Distance: <b className="text-emerald-300 font-mono">{distToStudentKm} km</b> away</span>
                  <span>•</span>
                  <span>Stop: <b className="text-white">{studentStop?.name}</b></span>
                </div>
              </div>

              {/* Action Buttons (Call Driver, Share Live Trip) */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${route.driver.phone}`}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Driver</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Live trip tracking link copied to clipboard!');
                  }}
                  className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition-all active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Trip</span>
                </button>
              </div>
            </div>

            {/* Driver Profile Card */}
            <div
              className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-200 ${
                activeTab !== 'driver' ? 'hidden lg:block' : 'block'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Assigned Bus & Driver
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-maroon-100 text-maroon-800 font-extrabold flex items-center justify-center text-lg border border-maroon-200 shrink-0">
                  {route.driver.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-slate-900 truncate">{route.driver.name}</div>
                  <div className="text-xs text-amber-600 font-bold flex items-center gap-1">
                    <span>★ 4.9</span>
                    <span className="text-slate-400 font-normal">• {route.driver.experienceYears} Years Exp</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Phone: {route.driver.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Bus Registration</div>
                  <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                    {route.busNumber}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Available Seats</div>
                  <div className="font-bold text-emerald-700 text-xs sm:text-sm">
                    {route.capacity - route.occupancy} Seats Left
                  </div>
                </div>
              </div>
            </div>

            {/* Stops Itinerary Checklist */}
            <div
              className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-200 ${
                activeTab !== 'route' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-maroon-700" />
                  <span>Stops & Arrival Schedule</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {route.stops.length} Stops
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {route.stops.map((stop, index) => {
                  const isStudentBoarding = studentStop?.name === stop.name;
                  const isDestination = index === route.stops.length - 1;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedStopName(stop.name);
                        toast.success(`Boarding point set to ${stop.name}`);
                      }}
                      className={`relative flex items-start justify-between gap-3 text-xs p-1.5 -ml-1.5 rounded-xl cursor-pointer transition-all ${
                        isStudentBoarding ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Bullet icon */}
                      <span
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all ${
                          isStudentBoarding
                            ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                            : stop.passed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isDestination
                            ? 'bg-maroon-700 border-maroon-700 text-white'
                            : 'bg-white border-slate-400 text-slate-600'
                        }`}
                      >
                        {stop.passed ? '✓' : isStudentBoarding ? '★' : index + 1}
                      </span>

                      <div>
                        <div
                          className={`font-bold ${
                            isStudentBoarding ? 'text-blue-700 text-sm' : 'text-slate-900'
                          }`}
                        >
                          {stop.name} {isStudentBoarding && '(Your Stop)'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {stop.passed ? (
                            <span className="text-emerald-700 font-semibold">Departed</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">Approaching</span>
                          )}
                          <span className="text-slate-400 ml-1.5 font-normal">• Click to select as pickup</span>
                        </div>
                      </div>

                      <span className="font-mono text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {stop.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Emergency SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-scale-up text-center">
            <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-red-200 text-red-600">
              <AlertCircle className="w-9 h-9 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Dispatch Emergency SOS Alert?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              This will immediately transmit your Register Number (
              <span className="font-bold text-slate-900">{userInfo.registerNumber}</span>), your assigned stop, and live coordinates to the Prathyusha Transport Command Desk.
            </p>

            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowSOSModal(false)}
                className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSOS}
                className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                Yes, Dispatch SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}