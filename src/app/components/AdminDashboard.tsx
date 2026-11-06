import { useState, useEffect } from 'react';
import {
  LogOut,
  Bus,
  Users,
  AlertCircle,
  Activity,
  MapPin,
  TrendingUp,
  Bell,
  CheckCircle2,
  Phone,
  Shield,
  PlusCircle,
  Radio,
  Send,
  Plus,
  Trash2,
  Search,
  RotateCcw,
  Navigation,
  Clock,
  Eye,
  X,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';
import RealLeafletMap from './RealLeafletMap';
import { busStore, BusRoute, SOSAlert, Announcement, BusStop, PEC_CAMPUS } from '../services/busData';
import { fetchRealRoadPath } from '../services/roadRoutingService';
import BusQrStickerSheet from './BusQrStickerSheet';

interface AdminDashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function AdminDashboard({ userInfo, onLogout }: AdminDashboardProps) {
  const [routes, setRoutes] = useState<BusRoute[]>(() => busStore.getRoutes());
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>(() => busStore.getSOSAlerts());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => busStore.getAnnouncements());
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(undefined);
  
  // Modals state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showViewStopsModal, setShowViewStopsModal] = useState(false);
  const [showQrStickersModal, setShowQrStickersModal] = useState(false);
  const [selectedStickerRouteId, setSelectedStickerRouteId] = useState<string>('all');
  const [targetRoute, setTargetRoute] = useState<BusRoute | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled'>('all');

  // Broadcast Notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeType, setNoticeType] = useState<'info' | 'warning' | 'urgent'>('info');

  // Add Route form state
  const [newRouteNumber, setNewRouteNumber] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newCapacity, setNewCapacity] = useState(55);
  const [newStops, setNewStops] = useState<BusStop[]>([
    { name: '', time: '06:00 AM', location: [13.115, 80.145], passed: true },
    { name: 'College (PEC Campus)', time: '07:30 AM', location: PEC_CAMPUS, passed: false }
  ]);

  // Add Stop form state
  const [stopName, setStopName] = useState('');
  const [stopTime, setStopTime] = useState('06:30 AM');
  const [stopLat, setStopLat] = useState<number>(13.125);
  const [stopLng, setStopLng] = useState<number>(80.05);

  // Real sync with central store
  useEffect(() => {
    const unsub = busStore.subscribe(() => {
      setRoutes(busStore.getRoutes());
      setSosAlerts(busStore.getSOSAlerts());
      setAnnouncements(busStore.getAnnouncements());
    });
    return unsub;
  }, []);

  const pendingAlerts = sosAlerts.filter((a) => a.status === 'pending');
  const activeBusesCount = routes.filter((r) => r.status === 'active').length;
  const totalOccupancy = routes.reduce((acc, r) => acc + (r.status === 'active' ? r.occupancy : 0), 0);

  // Filtered routes based on search and status
  const filteredRoutes = routes.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.routeNumber.toLowerCase().includes(query) ||
      r.routeName.toLowerCase().includes(query) ||
      r.busNumber.toLowerCase().includes(query) ||
      r.driver.name.toLowerCase().includes(query) ||
      r.stops.some((s) => s.name.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && r.status === 'active') ||
      (statusFilter === 'scheduled' && r.status !== 'active');

    return matchesSearch && matchesStatus;
  });

  const handleResolveAlert = (alertId: string) => {
    busStore.resolveSOS(alertId, 'Resolved by PEC Central Transport Officer');
    toast.success('SOS Alert marked as Resolved. Incident closed.');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      toast.error('Please enter both title and message for the notice');
      return;
    }
    busStore.addAnnouncement(noticeTitle.trim(), noticeMessage.trim(), noticeType);
    setShowNoticeModal(false);
    setNoticeTitle('');
    setNoticeMessage('');
    toast.success('Broadcast notice published to all student and driver devices.');
  };

  const handleResetOfficialRoutes = () => {
    if (window.confirm('Reset all fleet routes to the official 32 PDF Transport Schedule routes?')) {
      busStore.resetToOfficialPDFRoutes();
      toast.success('All 32 official routes from the PEC 2026 PDF have been synchronized!');
    }
  };

  // Add stop row inside the New Route modal
  const handleAddNewStopRow = () => {
    setNewStops((prev) => {
      const copy = [...prev];
      const insertIdx = Math.max(0, copy.length - 1);
      copy.splice(insertIdx, 0, {
        name: '',
        time: '06:15 AM',
        location: [13.12, 80.08],
        passed: false
      });
      return copy;
    });
  };

  const handleRemoveNewStopRow = (index: number) => {
    if (newStops.length <= 2) {
      toast.error('A route must have at least one pickup point and one destination');
      return;
    }
    setNewStops((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit New Route
  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteNumber.trim() || !newRouteName.trim() || !newBusNumber.trim()) {
      toast.error('Please fill in Route Number, Route Name, and Bus Registration Number');
      return;
    }

    const validStops = newStops.filter((s) => s.name.trim().length > 0);
    if (validStops.length < 2) {
      toast.error('Please provide at least 2 valid stops with names');
      return;
    }

    const routeId = newRouteNumber.trim().startsWith('RNo:')
      ? newRouteNumber.trim()
      : `RNo:${newRouteNumber.trim()}`;

    busStore.addRoute({
      id: routeId,
      routeNumber: routeId,
      routeName: newRouteName.trim().toUpperCase(),
      busNumber: newBusNumber.trim().toUpperCase(),
      driver: {
        name: newDriverName.trim() || 'Assigned Driver',
        phone: newDriverPhone.trim() || '+91 94440 00000',
        license: `TN-20-2020-${Math.floor(1000 + Math.random() * 9000)}`,
        experienceYears: 8
      },
      status: 'active',
      capacity: newCapacity,
      occupancy: Math.round(newCapacity * 0.8),
      speedKmH: 42,
      stops: validStops
    });

    // In background, fetch street-by-street driving road geometry
    fetchRealRoadPath(validStops, routeId).then((realRoadPts) => {
      if (realRoadPts && realRoadPts.length > 5) {
        busStore.updateRoute(routeId, { path: realRoadPts });
      }
    });

    toast.success(`Route ${routeId} (${newRouteName}) added to fleet!`);
    setShowAddRouteModal(false);
    // Reset form
    setNewRouteNumber('');
    setNewRouteName('');
    setNewBusNumber('');
    setNewDriverName('');
    setNewDriverPhone('');
    setNewStops([
      { name: '', time: '06:00 AM', location: [13.115, 80.145], passed: true },
      { name: 'College (PEC Campus)', time: '07:30 AM', location: PEC_CAMPUS, passed: false }
    ]);
  };

  // Submit Add Stop to existing route
  const handleAddStopToExistingRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoute) return;
    if (!stopName.trim()) {
      toast.error('Please enter a stop name');
      return;
    }

    const newStopObj: BusStop = {
      name: stopName.trim(),
      time: stopTime.trim() || '06:30 AM',
      location: [Number(stopLat), Number(stopLng)],
      passed: false
    };

    busStore.addStop(targetRoute.id, newStopObj);
    const updated = busStore.getRouteById(targetRoute.id);
    if (updated) {
      fetchRealRoadPath(updated.stops, updated.id).then((realRoadPts) => {
        if (realRoadPts && realRoadPts.length > 5) {
          busStore.updateRoute(updated.id, { path: realRoadPts });
        }
      });
    }

    toast.success(`Stop "${stopName.trim()}" added to ${targetRoute.routeNumber}!`);
    setShowAddStopModal(false);
    setStopName('');
  };

  const openAddStopForRoute = (r: BusRoute) => {
    setTargetRoute(r);
    // Estimate intermediate coordinates based on route
    if (r.stops.length > 0) {
      const midStop = r.stops[Math.floor(r.stops.length / 2)];
      setStopLat(midStop.location[0]);
      setStopLng(midStop.location[1]);
    } else {
      setStopLat(13.125);
      setStopLng(80.05);
    }
    setShowAddStopModal(true);
  };

  const openViewStopsForRoute = (r: BusRoute) => {
    setTargetRoute(r);
    setShowViewStopsModal(true);
  };

  const handleDeleteStopFromRoute = (stopIndex: number) => {
    if (!targetRoute) return;
    if (targetRoute.stops.length <= 2) {
      toast.error('Cannot remove stop. A route must have at least 2 stops.');
      return;
    }
    busStore.deleteStop(targetRoute.id, stopIndex);
    // Refresh local targetRoute
    const updated = busStore.getRouteById(targetRoute.id);
    if (updated) setTargetRoute(updated);
    toast.success('Stop removed successfully');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans">
      {/* Admin Command Header */}
      <header className="sticky top-0 z-30 bg-maroon-900 text-white shadow-md border-b border-maroon-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" />
            <div className="hidden sm:block border-l border-maroon-700/60 pl-3">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Central Fleet Command Center
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  32 PDF Routes Active
                </span>
              </div>
              <p className="text-xs text-maroon-200">
                Prathyusha Engineering College Transport Division • 2026 Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Add Route Button */}
            <button
              type="button"
              onClick={() => setShowAddRouteModal(true)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Route</span>
            </button>

            {/* Sync Official PDF Routes */}
            <button
              type="button"
              onClick={handleResetOfficialRoutes}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-all"
              title="Reset and sync all 32 routes from the official 2026 PDF"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sync PDF Routes</span>
            </button>

            {/* Driver QR Consolidation & Testing Console */}
            <button
              type="button"
              onClick={() => {
                setSelectedStickerRouteId('all');
                setShowQrStickersModal(true);
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Consolidate Driver QR Codes & Test in Bus"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Driver QR Console</span>
            </button>

            {/* Broadcast Notice Button */}
            <button
              type="button"
              onClick={() => setShowNoticeModal(true)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notice</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-maroon-800 hover:bg-maroon-700 text-maroon-100 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-maroon-700 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
        {/* Dynamic Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Fleet */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Fleet</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{routes.length} Routes</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">All 2026 PDF Corridors</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Bus className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Active on Trip */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active On Route</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{activeBusesCount} Buses</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">● Transmitting Live GPS</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Boarding Stops */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Boarding Points</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {routes.reduce((acc, r) => acc + r.stops.length, 0)} Stops
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Chennai & Thiruvallur</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: SOS Alerts */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Emergency SOS</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">{pendingAlerts.length} Alerts</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Priority Dispatch Response</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Driver QR Code Consolidation & In-Bus Testing Hub Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-400/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Driver QR Consolidation & In-Bus Testing Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Admin Permission Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Consolidate Driver Seat QR Stickers for all 32 buses. College Bus Admin has full authority to test live GPS trip broadcasting in the bus, copy direct mobile links, and print laminated fleet seat stickers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedStickerRouteId('all');
                setShowQrStickersModal(true);
              }}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Driver QR Console & Test in Bus</span>
            </button>
          </div>
        </div>

        {/* Real-Time Live Map Overview */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Real-Time College Fleet Map (Official 2026 Corridors)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displaying all PEC buses and stages converging towards Prathyusha Engineering College Campus.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Inspect Route:</span>
              <select
                value={selectedRouteId || ''}
                onChange={(e) => setSelectedRouteId(e.target.value || undefined)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-maroon-700/20"
              >
                <option value="">Show All Routes ({routes.length})</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeNumber} – {r.routeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200">
            <RealLeafletMap
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              height="100%"
            />
          </div>
        </div>

        {/* Fleet Vehicles & Route Directory Table with Search & Add Controls */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Official Fleet Routes & Boarding Points Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Stage-wise boarding details with scheduled arrival timings from the 2026 college transport notification.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowAddRouteModal(true)}
                className="py-2 px-3.5 bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Route & Stops</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search route (e.g. RNo:12, RNo:09), stop name (e.g. Velachery, Redhills, Tiruttani), driver..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 bg-slate-50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                All ({routes.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Active ({activeBusesCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('scheduled')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'scheduled' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Scheduled ({routes.length - activeBusesCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Route / Vehicle</th>
                  <th className="py-3 px-3">Driver Profile</th>
                  <th className="py-3 px-3">Start ➔ End Schedule</th>
                  <th className="py-3 px-3">Stops</th>
                  <th className="py-3 px-3">Load</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{r.routeNumber}</span>
                        <span className="text-[10px] text-maroon-700 font-mono font-bold bg-maroon-50 px-1.5 py-0.5 rounded border border-maroon-200">
                          {r.busNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold truncate max-w-[220px]" title={r.routeName}>
                        {r.routeName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{r.driver.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.driver.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 truncate max-w-[190px]">
                        {r.stops[0]?.name || 'Origin'} ({r.stops[0]?.time || '5:30 AM'})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ➔ PEC Campus ({r.stops[r.stops.length - 1]?.time || '7:30 AM'})
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => openViewStopsForRoute(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-maroon-700" />
                        <span>{r.stops.length} Stops</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {r.occupancy} / {r.capacity}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          r.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStickerRouteId(r.id);
                            setShowQrStickersModal(true);
                          }}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-all"
                          title="Print / View Driver Seat QR Sticker for this bus"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAddStopForRoute(r)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all"
                          title="Add new stop to this route"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openViewStopsForRoute(r)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                          title="View all boarding points & timings"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD ROUTE & STOPS */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Bus Route & Stage Stops</h3>
                <p className="text-xs text-slate-500">
                  Register a new route corridor according to college transport schedules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRouteModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Route Number</label>
                  <input
                    type="text"
                    required
                    value={newRouteNumber}
                    onChange={(e) => setNewRouteNumber(e.target.value)}
                    placeholder="e.g. RNo:40"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Bus Registration No.</label>
                  <input
                    type="text"
                    required
                    value={newBusNumber}
                    onChange={(e) => setNewBusNumber(e.target.value)}
                    placeholder="e.g. TN-20-BZ-4140"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Route Name / Corridors</label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. POONAMALLEE Via THIRUMALISAI"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Driver Name</label>
                  <input
                    type="text"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="Driver full name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Driver Phone</label>
                  <input
                    type="text"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="+91 94440 00000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Total Capacity</label>
                  <input
                    type="number"
                    min={20}
                    max={70}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>
              </div>

              {/* Dynamic Stops Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-maroon-700" />
                    <span>Boarding Points & Scheduled Departure Timings</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddNewStopRow}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Boarding Stop</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newStops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-maroon-100 text-maroon-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={stop.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewStops((prev) => {
                            const c = [...prev];
                            c[idx].name = val;
                            return c;
                          });
                        }}
                        placeholder="Boarding point name (e.g. Thiruvallur)"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                      />
                      <input
                        type="text"
                        required
                        value={stop.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewStops((prev) => {
                            const c = [...prev];
                            c[idx].time = val;
                            return c;
                          });
                        }}
                        placeholder="Time (6:15 AM)"
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono font-bold"
                      />
                      {newStops.length > 2 && idx < newStops.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNewStopRow(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  Save Route & Stops
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STOP TO ROUTE */}
      {showAddStopModal && targetRoute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add Boarding Stop</h3>
                <p className="text-xs text-slate-500">
                  Target Route: <b className="text-maroon-700">{targetRoute.routeNumber}</b> ({targetRoute.routeName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStopModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStopToExistingRoute} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Boarding Stop Name</label>
                <input
                  type="text"
                  required
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                  placeholder="e.g. Thiruvallur Bus Stand"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Scheduled Arrival Time</label>
                <input
                  type="text"
                  required
                  value={stopTime}
                  onChange={(e) => setStopTime(e.target.value)}
                  placeholder="e.g. 06:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={stopLat}
                    onChange={(e) => setStopLat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={stopLng}
                    onChange={(e) => setStopLng(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  Add Stop to Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW & MANAGE STOPS ITINERARY */}
      {showViewStopsModal && targetRoute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {targetRoute.routeNumber}: Boarding Stages
                </h3>
                <p className="text-xs text-slate-500">{targetRoute.routeName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowViewStopsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {targetRoute.stops.map((stop, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-maroon-700 text-white font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900">{stop.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-maroon-700">{stop.time}</span>
                        <span>•</span>
                        <span>
                          [{stop.location[0].toFixed(3)}, {stop.location[1].toFixed(3)}]
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {targetRoute.stops.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStopFromRoute(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowViewStopsModal(false);
                  openAddStopForRoute(targetRoute);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Stop</span>
              </button>
              <button
                type="button"
                onClick={() => setShowViewStopsModal(false)}
                className="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900">Broadcast Campus Notice</h3>
            <p className="text-xs text-slate-500 mt-1">
              This message will immediately appear on all student and driver devices.
            </p>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Notice Title</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Bus Timing Rescheduled"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Notice Content</label>
                <textarea
                  required
                  rows={3}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Enter notice details for students and drivers..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Notice Priority</label>
                <select
                  value={noticeType}
                  onChange={(e: any) => setNoticeType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="info">General Information</option>
                  <option value="warning">Important Alert (Yellow)</option>
                  <option value="urgent">Urgent / Emergency (Red)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 5: PRINTABLE BUS QR STICKER SHEET */}
      {showQrStickersModal && (
        <BusQrStickerSheet
          onClose={() => setShowQrStickersModal(false)}
          selectedRouteId={selectedStickerRouteId}
        />
      )}
    </div>
  );
}