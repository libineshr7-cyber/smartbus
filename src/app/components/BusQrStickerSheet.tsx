import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  X,
  Bus,
  Check,
  Search,
  ExternalLink,
  Copy,
  Play,
  Radio,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';
import { busStore, BusRoute } from '../services/busData';
import BusQrTripStarter from './BusQrTripStarter';

interface BusQrStickerSheetProps {
  onClose: () => void;
  selectedRouteId?: string;
}

export default function BusQrStickerSheet({ onClose, selectedRouteId }: BusQrStickerSheetProps) {
  const routes = busStore.getRoutes();
  const [activeTab, setActiveTab] = useState<'consolidation' | 'stickers'>('consolidation');
  const [selectedId, setSelectedId] = useState<string>(
    selectedRouteId && selectedRouteId !== 'all' ? selectedRouteId : routes[0]?.id || 'RNo:12'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [testingRouteId, setTestingRouteId] = useState<string | null>(null);

  const selectedRoute = routes.find((r) => r.id === selectedId) || routes[0];

  const filteredRoutes = routes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.routeNumber.toLowerCase().includes(q) ||
      r.routeName.toLowerCase().includes(q) ||
      r.busNumber.toLowerCase().includes(q) ||
      r.driver.name.toLowerCase().includes(q)
    );
  });

  const getScanUrl = (routeId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartbus.prathyusha.edu.in';
    return `${origin}/?bus_qr=${encodeURIComponent(routeId)}`;
  };

  const handleCopyUrl = (routeId: string) => {
    const url = getScanUrl(routeId);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success(`Copied QR Trip URL for ${routeId}! Send this link or scan in the bus.`);
    } else {
      toast.info(`URL: ${url}`);
    }
  };

  const handleOpenInNewWindow = (routeId: string) => {
    const url = getScanUrl(routeId);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // If Admin opened test trip mode
  if (testingRouteId) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-amber-400">Admin Live Bus Testing Mode</span>
            <span className="text-slate-400">({testingRouteId})</span>
          </div>
          <button
            type="button"
            onClick={() => setTestingRouteId(null)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700"
          >
            ← Return to QR Consolidation Console
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <BusQrTripStarter
            initialRouteId={testingRouteId}
            onClose={() => setTestingRouteId(null)}
            onTripStarted={(rId) => {
              toast.success(`Admin trip broadcast active for ${rId}! Students can now track this bus.`);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col p-2 sm:p-5 overflow-y-auto font-sans">
      {/* Top Header Card (Hidden when printing) */}
      <div className="max-w-6xl w-full mx-auto bg-slate-900 text-white rounded-3xl p-4 sm:p-5 mb-4 shadow-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="light" />
          <div>
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
              <span>Driver QR Code Consolidation & Testing Console</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                Admin Fleet Permissions
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidate driver seat QR stickers, test real-time trip GPS in the bus, and print fleet passes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-800 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('consolidation')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'consolidation'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Consolidation & In-Bus Testing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stickers')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'stickers'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Print Seat Stickers
            </button>
          </div>

          {activeTab === 'stickers' && (
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stickers</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TAB 1: CONSOLIDATION & IN-BUS TESTING */}
      {activeTab === 'consolidation' && (
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Bus Fleet Directory (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col max-h-[78vh]">
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider">
                  College Bus Fleet ({filteredRoutes.length} Buses)
                </span>
                <span className="text-slate-400 text-[11px]">Select to inspect QR</span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search route, corridor, driver, bus no..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredRoutes.map((r) => {
                const isSelected = r.id === selectedId;
                const isActive = r.status === 'active';

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/80 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="space-y-0.5 truncate flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {r.routeNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {r.busNumber}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{r.routeName}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Driver: {r.driver.name} • {r.stops.length} Stages
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        {r.stops[0]?.time}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Driver QR Inspector & In-Bus Testing Permission (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Inspector Top Bar */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-sm font-mono">
                    {selectedRoute.routeNumber}
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    {selectedRoute.busNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                      selectedRoute.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ● {selectedRoute.status}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-white mt-1">
                  {selectedRoute.routeName}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Stages</span>
                <div className="text-base font-extrabold text-amber-400">
                  {selectedRoute.stops.length} Boarding Stops
                </div>
              </div>
            </div>

            {/* Center Area: QR Code + Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Left: Scannable QR Code */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-inner">
                  <QRCodeSVG
                    value={getScanUrl(selectedRoute.id)}
                    size={170}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-950 uppercase tracking-wider">
                    {selectedRoute.routeNumber} • Driver Seat Sticker
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Scan with Mobile Camera in Bus
                  </div>
                </div>
              </div>

              {/* Right: Driver Info & Admin Testing Permissions */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Driver Information
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{selectedRoute.driver.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{selectedRoute.driver.phone}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    License: <span className="text-slate-300 font-mono">{selectedRoute.driver.license}</span>
                  </div>
                </div>

                {/* Primary Action: Test Driver Trip in Bus */}
                <button
                  type="button"
                  onClick={() => setTestingRouteId(selectedRoute.id)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>🧪 Test Driver Trip in Bus</span>
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedRoute.id)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenInNewWindow(selectedRoute.id)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Tab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* How In-Bus QR Testing Works Info Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Zero-Cost In-Bus QR Operation Workflow:</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                <li>
                  <strong className="text-white">Physical QR Sticker:</strong> Affixed near the driver's steering dashboard inside the bus.
                </li>
                <li>
                  <strong className="text-white">Driver or 1st Student:</strong> Scans the sticker with any smartphone camera (no app install needed).
                </li>
                <li>
                  <strong className="text-white">Location Permission:</strong> Phone allows GPS access, instantly broadcasting live coordinates to all 5,000+ PEC students.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRINTABLE SEAT STICKERS */}
      {activeTab === 'stickers' && (
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:max-w-none print:w-full">
          {filteredRoutes.map((route) => {
            const scanUrl = getScanUrl(route.id);

            return (
              <div
                key={route.id}
                className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 shadow-xl flex flex-col justify-between page-break-inside-avoid print:border-2 print:border-black print:rounded-2xl print:p-5 print:shadow-none"
              >
                {/* College Header */}
                <div className="flex items-center justify-between border-b-2 border-maroon-900 pb-3">
                  <Logo size="sm" />
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Official College Bus
                    </div>
                    <div className="text-xs font-black text-maroon-800">2026 Fleet Pass</div>
                  </div>
                </div>

                {/* Center Details with QR Code */}
                <div className="py-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
                  {/* Left: Route Information */}
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 font-black text-sm tracking-wide border border-maroon-300">
                      {route.routeNumber}
                    </div>
                    <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                      {route.busNumber}
                    </div>
                    <div className="text-xs font-extrabold text-slate-700 leading-snug">
                      {route.routeName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Driver: <span className="font-bold text-slate-800">{route.driver.name}</span> ({route.driver.phone})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {route.stops.length} Boarding Stages • {route.stops[0]?.time} to {route.stops[route.stops.length - 1]?.time}
                    </div>
                  </div>

                  {/* Right: High-Res QR Code */}
                  <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm shrink-0 flex flex-col items-center">
                    <QRCodeSVG
                      value={scanUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">
                      Scan with Phone Camera
                    </span>
                  </div>
                </div>

                {/* Bottom Instructions Footer */}
                <div className="pt-3 border-t-2 border-slate-200 text-center space-y-1">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    📌 Fix This Sticker Near The Driver's Dashboard
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight">
                    Driver Onboarding: Scan this QR with your phone camera ➔ Enter Driver Name &amp; Route Number ➔ Share GPS Location to start live tracking for students.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
