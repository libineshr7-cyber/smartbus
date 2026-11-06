import { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  MapPin,
  Navigation,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Clock,
  Radio,
  Camera,
  X,
  ArrowRight,
  ShieldCheck,
  Compass,
  Bus,
  Search,
  Sparkles,
  Info,
  RefreshCw,
  Check,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';
import { busStore, BusRoute, BusStop } from '../services/busData';

interface BusQrTripStarterProps {
  initialRouteId?: string;
  onClose?: () => void;
  onTripStarted?: (routeId: string) => void;
}

export default function BusQrTripStarter({
  initialRouteId,
  onClose,
  onTripStarted
}: BusQrTripStarterProps) {
  const routes = busStore.getRoutes();

  // Selected route state (defaults to scanned route or first route)
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => {
    if (initialRouteId) {
      const match = routes.find(
        (r) =>
          r.id.toLowerCase() === initialRouteId.toLowerCase() ||
          r.routeNumber.toLowerCase() === initialRouteId.toLowerCase()
      );
      if (match) return match.id;
    }
    return routes[0]?.id || 'RNo:12';
  });

  const route = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // 1. Driver Name state (asked when scanning QR)
  const [driverName, setDriverName] = useState<string>(route?.driver?.name || '');
  const [driverPhone, setDriverPhone] = useState<string>(route?.driver?.phone || '+91 94441 55012');

  // Search/Filter for route numbers
  const [routeSearchQuery, setRouteSearchQuery] = useState<string>('');
  const [isChangingRoute, setIsChangingRoute] = useState<boolean>(false);

  // GPS & Live Broadcasting State
  const [isBroadcasting, setIsBroadcasting] = useState(route?.status === 'active');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [liveLocation, setLiveLocation] = useState<[number, number]>(
    route?.currentLocation || [13.1332, 79.9725]
  );
  const [liveSpeed, setLiveSpeed] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Camera QR scanner state
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track if QR code was newly scanned/detected
  const [qrScannedBanner, setQrScannedBanner] = useState<string | null>(
    initialRouteId ? `Scanned Bus QR: ${initialRouteId}` : null
  );

  // Watch ID for real device GPS
  const watchIdRef = useRef<number | null>(null);

  // Update driver details when route selection changes
  useEffect(() => {
    if (route) {
      // If driver name is still default or empty, prefill from route directory
      if (!driverName || routes.some((r) => r.driver.name === driverName)) {
        setDriverName(route.driver.name);
      }
      setDriverPhone(route.driver.phone);
      setIsBroadcasting(route.status === 'active');
      if (route.currentLocation) {
        setLiveLocation(route.currentLocation);
      }
    }
  }, [selectedRouteId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopGpsWatchers();
      stopCameraStream();
    };
  }, []);

  // Timer loop for active trip duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isBroadcasting) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBroadcasting]);

  const stopGpsWatchers = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // SHARE REAL-TIME GPS LOCATION & START ROUTE TRACKING (NO SIMULATION)
  const handleShareGpsAndStartTrip = () => {
    // 1. Validate Driver Name
    if (!driverName.trim()) {
      toast.error('Please enter the Driver Name');
      return;
    }

    // 2. Validate Route Number
    if (!selectedRouteId || !route) {
      toast.error('Please verify the Bus Route Number');
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('denied');
      toast.error('Geolocation is not supported by your device or browser.');
      return;
    }

    setGpsStatus('requesting');
    toast.info('Acquiring real-time satellite GPS coordinates from device...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Location Permission Granted!
        setGpsStatus('granted');
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
        const hdg = pos.coords.heading || 0;
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 5;

        setLiveLocation([lat, lng]);
        setLiveSpeed(spd);
        setGpsAccuracy(acc);

        // Update central bus store with real-time GPS telemetry
        busStore.startTrip(route.id, driverName.trim(), driverPhone.trim());
        busStore.updateBusLocation(route.id, [lat, lng], spd, hdg);

        setIsBroadcasting(true);
        setElapsedSeconds(0);

        // Begin continuous real-time device GPS watch
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const wLat = watchPos.coords.latitude;
            const wLng = watchPos.coords.longitude;
            const wSpd = watchPos.coords.speed ? Math.round(watchPos.coords.speed * 3.6) : 0;
            const wHdg = watchPos.coords.heading || 0;
            const wAcc = watchPos.coords.accuracy ? Math.round(watchPos.coords.accuracy) : 5;

            setLiveLocation([wLat, wLng]);
            setLiveSpeed(wSpd);
            setGpsAccuracy(wAcc);
            busStore.updateBusLocation(route.id, [wLat, wLng], wSpd, wHdg);
          },
          (watchErr) => {
            console.warn('Real-time GPS continuous watch warning:', watchErr);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 20000
          }
        );

        toast.success(
          `🛰️ Real-Time GPS Active! Transmitting live coordinates for Route ${route.routeNumber} (${route.routeName}).`
        );
        onTripStarted?.(route.id);
      },
      (err) => {
        console.warn('Real-time Geolocation error:', err);
        setGpsStatus('denied');
        toast.error(`GPS Error: ${err.message}. Device GPS permission is required for real-time tracking.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // STOP SHARING GPS & CONCLUDE TRIP
  const handleStopSharingGps = () => {
    stopGpsWatchers();
    busStore.stopTrip(route.id);
    setIsBroadcasting(false);
    setGpsStatus('idle');
    toast.info(`Trip concluded for ${route.routeNumber}. GPS sharing stopped.`);
  };

  // ADVANCE NEXT STOP
  const handleNextStop = () => {
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
        } else {
          currentRoutes[idx].nextStop = 'College (PEC Campus)';
        }
        busStore.saveRoutes(currentRoutes);
        toast.success(`Departed from ${stops[nextUnpassed].name}. Next: ${currentRoutes[idx].nextStop}`);
      } else {
        toast.info('All scheduled boarding stops have been reached!');
      }
    }
  };

  // CAMERA SCANNER CONTROLS
  const startCameraStream = async () => {
    try {
      setShowCameraScanner(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check if BarcodeDetector is available natively
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code']
          });
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const rawVal = barcodes[0].rawValue;
                  handleDetectedQrCode(rawVal);
                }
              } catch (e) {
                // Ignore frame decode errors
              }
            }
          }, 400);
        } catch (e) {
          console.warn('BarcodeDetector initialization skipped');
        }
      }
    } catch (err) {
      toast.error('Unable to access camera. Please allow camera access or choose bus route manually.');
      setShowCameraScanner(false);
    }
  };

  const handleDetectedQrCode = (scannedContent: string) => {
    stopCameraStream();
    // Check if URL with ?bus_qr=... or direct route ID like RNo:12
    let matchedId = '';
    if (scannedContent.includes('bus_qr=')) {
      const match = scannedContent.match(/bus_qr=([^&]+)/);
      if (match) matchedId = decodeURIComponent(match[1]);
    } else {
      matchedId = scannedContent.trim();
    }

    const found = routes.find(
      (r) =>
        r.id.toLowerCase() === matchedId.toLowerCase() ||
        r.routeNumber.toLowerCase() === matchedId.toLowerCase()
    );

    if (found) {
      setSelectedRouteId(found.id);
      setDriverName(found.driver.name);
      setDriverPhone(found.driver.phone);
      setQrScannedBanner(`QR Scanned: ${found.routeNumber} (${found.routeName})`);
      toast.success(`✅ Scanned QR for Route ${found.routeNumber}! Please confirm details.`);
    } else {
      toast.info(`Scanned: ${scannedContent}. Please select your route from list.`);
    }
  };

  const stopCameraStream = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setShowCameraScanner(false);
  };

  const handleQuickSelectRoute = (routeId: string) => {
    stopCameraStream();
    const found = routes.find((r) => r.id === routeId);
    if (found) {
      setSelectedRouteId(found.id);
      setDriverName(found.driver.name);
      setDriverPhone(found.driver.phone);
      setQrScannedBanner(`Route Selected: ${found.routeNumber} (${found.routeName})`);
      toast.success(`✅ Route ${found.routeNumber} selected! Enter your name and share live GPS.`);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredRoutes = routes.filter((r) => {
    if (!routeSearchQuery.trim()) return true;
    const q = routeSearchQuery.toLowerCase();
    return (
      r.routeNumber.toLowerCase().includes(q) ||
      r.routeName.toLowerCase().includes(q) ||
      r.busNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" variant="light" />
            <div>
              <h1 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Driver Bus QR Dispatch</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Driver Mode
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Scan QR • Enter Name & Route • Share GPS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showCameraScanner && !isBroadcasting && (
              <button
                type="button"
                onClick={startCameraStream}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* Scanned QR Notification Pill */}
        {qrScannedBanner && !isBroadcasting && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-2xl flex items-center justify-between gap-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{qrScannedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setQrScannedBanner(null)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* Camera QR Viewfinder Modal */}
        {showCameraScanner && (
          <div className="bg-slate-900 border border-blue-500/50 rounded-3xl p-4 space-y-3 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Camera className="w-4 h-4" />
                <span>Scan Official Bus QR Sticker</span>
              </span>
              <button
                type="button"
                onClick={stopCameraStream}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-blue-500 flex items-center justify-center bg-black">
              <video ref={videoRef} autoPlay playsInline className="size-full object-cover" />
              <div className="absolute inset-0 border-4 border-blue-400/30 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Point your camera at the QR code sticker placed near the driver's seat.
            </p>

            {/* Quick Bus Route Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Or Quick-Select Route:
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['RNo:12', 'RNo:31', 'RNo:09', 'RNo:5', 'RNo:8'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleQuickSelectRoute(id)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-amber-400 border border-slate-700 transition-colors"
                  >
                    Select {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE BROADCASTING DASHBOARD (WHEN GPS IS BEING SHARED LIVE) */}
        {/* ------------------------------------------------------------- */}
        {isBroadcasting ? (
          <div className="bg-slate-900 rounded-3xl p-5 border border-emerald-500/50 shadow-2xl shadow-emerald-950/50 space-y-5 animate-scaleUp">
            {/* Live Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Live GPS Sharing Active
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-xl text-slate-200 border border-slate-800">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            {/* Driver & Route Info Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Driver In Charge
                  </div>
                  <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>{driverName || route.driver.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Bus Plate
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-300">{route.busNumber}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                    Route Number
                  </div>
                  <div className="text-lg font-black text-amber-400 font-mono">{route.routeNumber}</div>
                  <div className="text-xs text-slate-300 font-semibold">{route.routeName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Speed
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {liveSpeed}{' '}
                    <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Telemetry Pill */}
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Transmitting GPS Telemetry</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {`Real-Time GPS ±${gpsAccuracy || 5}m`}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <span>Lat: {liveLocation[0].toFixed(5)}</span>
                <span>Lng: {liveLocation[1].toFixed(5)}</span>
              </div>
            </div>

            {/* Current / Next Stop Tracker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Approaching Stage Stop:</span>
                <span className="font-extrabold text-blue-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{route.nextStop}</span>
                </span>
              </div>

              {/* Advance Stop Button */}
              <button
                type="button"
                onClick={handleNextStop}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Reached & Depart Next Stop</span>
              </button>
            </div>

            {/* Stop Sharing GPS & Conclude Trip */}
            <button
              type="button"
              onClick={handleStopSharingGps}
              className="w-full py-3.5 px-4 bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-500/40"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Sharing GPS & Conclude Trip</span>
            </button>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* DRIVER QR VERIFICATION FORM: ASKS NAME, ROUTE NUMBER & GPS   */
          /* ------------------------------------------------------------- */
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-5">
            {/* Form Title & Introduction */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <span>Driver QR Trip Verification</span>
                </h2>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Step-by-Step
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you scan the bus QR sticker, verify your details below and allow GPS location to broadcast your bus in real-time.
              </p>
            </div>

            {/* ========================================================= */}
            {/* STEP 1: ASK DRIVER NAME                                   */}
            {/* ========================================================= */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-amber-500 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">
                    1
                  </span>
                  <span>Driver Name</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">Required</span>
              </div>

              <div className="relative mt-2">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter Driver's Full Name (e.g. M. Shanmugam)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Shown to waiting students and parent tracking</span>
                {route.driver.name && driverName !== route.driver.name && (
                  <button
                    type="button"
                    onClick={() => setDriverName(route.driver.name)}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Reset to {route.driver.name}
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* STEP 2: ASK / CONFIRM ROUTE NUMBER                        */}
            {/* ========================================================= */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-amber-500 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">
                    2
                  </span>
                  <span>Bus Route Number</span>
                  <span className="text-red-400">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsChangingRoute(!isChangingRoute)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isChangingRoute ? 'Done' : 'Change Route'}</span>
                </button>
              </div>

              {/* Scanned Route Preview Pill */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-mono">
                        {route.routeNumber}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                        {route.busNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold truncate max-w-[220px] sm:max-w-[280px]">
                      {route.routeName}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div className="font-bold text-slate-300">{route.stops.length} Stops</div>
                  <div>{route.stops[0]?.time} Start</div>
                </div>
              </div>

              {/* Expandable Route Selector if driver needs to change route */}
              {isChangingRoute && (
                <div className="space-y-2 pt-2 border-t border-slate-800 animate-fadeIn">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={routeSearchQuery}
                      onChange={(e) => setRouteSearchQuery(e.target.value)}
                      placeholder="Search Route No (e.g. RNo:12, Velachery)..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {filteredRoutes.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRouteId(r.id);
                          setIsChangingRoute(false);
                          setDriverName(r.driver.name);
                          setDriverPhone(r.driver.phone);
                          toast.info(`Selected Route ${r.routeNumber}: ${r.routeName}`);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                          r.id === selectedRouteId
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">{r.routeNumber}</span>
                          <span className="truncate max-w-[190px]">{r.routeName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{r.busNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Driver Contact */}
            <div className="space-y-1 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Driver Contact Phone</span>
                <span className="text-[10px] text-slate-500">For Fleet Dispatch</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+91 94441 00000"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* STEP 3: SHARE GPS LOCATION & START TRIP                   */}
            {/* ========================================================= */}
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[11px] font-black">
                    3
                  </span>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-wider">
                      Share Live GPS Location
                    </div>
                    <div className="text-[11px] text-emerald-300/80">
                      Streams location directly from your smartphone
                    </div>
                  </div>
                </div>
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                When you tap below, your browser will prompt for location access. Once granted, students and transport staff will see your bus location update continuously.
              </p>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-slate-400 font-medium">GPS Access Status:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    gpsStatus === 'granted'
                      ? 'text-emerald-400'
                      : gpsStatus === 'denied'
                      ? 'text-red-400'
                      : gpsStatus === 'requesting'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {gpsStatus === 'granted' && <Check className="w-3.5 h-3.5" />}
                  {gpsStatus === 'granted'
                    ? 'Permission Granted'
                    : gpsStatus === 'denied'
                    ? 'Permission Denied'
                    : gpsStatus === 'requesting'
                    ? 'Requesting Device GPS...'
                    : 'Ready to Request Permission'}
                </span>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <button
                type="button"
                onClick={handleShareGpsAndStartTrip}
                className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <Radio className="w-5 h-5" />
                <span>Share GPS Location & Start Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Error banner if device permission is denied */}
              {gpsStatus === 'denied' && (
                <div className="pt-2 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-center text-xs text-red-300">
                  <p className="font-semibold">
                    Real-time GPS access is required to broadcast live tracking. Please enable location permissions in your browser or device settings and try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boarding Stages Sequence Preview */}
        <div className="bg-slate-900/80 rounded-3xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Route Boarding Stops ({route.stops.length} Stops)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {route.stops[0]?.time} ➔ {route.stops[route.stops.length - 1]?.time}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 text-xs">
            {route.stops.map((stop, idx) => (
              <div
                key={idx}
                className={`shrink-0 p-2.5 rounded-xl border min-w-[135px] ${
                  stop.passed
                    ? 'bg-emerald-950/30 border-emerald-800/40 opacity-70'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="text-[10px] text-amber-400 font-bold">
                  {idx + 1}. {stop.time}
                </div>
                <div className="font-bold text-white truncate max-w-[125px]">{stop.name}</div>
                {stop.passed && (
                  <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Departed</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
        Prathyusha Engineering College Transport System • 2026 QR GPS Dispatch
      </footer>
    </div>
  );
}
