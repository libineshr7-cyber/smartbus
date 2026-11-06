import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BusRoute, BusStop, PEC_CAMPUS } from '../services/busData';
import { REAL_ROAD_PATHS } from '../services/realRoadData';
import { Locate, Compass, Layers, Crosshair, MapPin } from 'lucide-react';

interface RapidoGoogleMapProps {
  route: BusRoute;
  busPosition: {
    lat: number;
    lng: number;
    bearing: number;
    speedKmH: number;
  };
  studentStop?: BusStop;
  studentLocation?: [number, number] | null;
  followBus?: boolean;
  onToggleFollow?: (follow: boolean) => void;
  className?: string;
  height?: string;
}

export default function RapidoGoogleMap({
  route,
  busPosition,
  studentStop,
  studentLocation,
  followBus = true,
  onToggleFollow,
  className = '',
  height = '100%'
}: RapidoGoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const studentMarkerRef = useRef<L.Marker | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Initialize Map with Google Maps Tiles
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Google Maps Roadmap free tile service
    const googleTileUrl =
      mapType === 'roadmap'
        ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

    const map = L.map(containerRef.current, {
      center: [busPosition.lat, busPosition.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    const tiles = L.tileLayer(googleTileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Zoom control in bottom-right for easy one-hand mobile reach
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Setup Stops layer
    const stopsGroup = L.layerGroup().addTo(map);
    stopsLayerRef.current = stopsGroup;

    // 1. Render PEC Campus Pin
    const campusIcon = L.divIcon({
      className: 'pec-campus-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: #800000;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 11px;
            box-shadow: 0 4px 14px rgba(128,0,0,0.5);
            border: 3px solid #ffffff;
          ">
            PEC
          </div>
          <div style="
            background: #800000;
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 3px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            Campus Main Gate
          </div>
        </div>
      `,
      iconSize: [36, 52],
      iconAnchor: [18, 20]
    });

    L.marker(PEC_CAMPUS, { icon: campusIcon })
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong style="color: #800000; font-size: 13px;">Prathyusha Engineering College</strong><br/>
          <span>Campus Transport Terminal</span><br/>
          <span style="color: #64748b; font-size: 11px;">Aranvoyalkuppam, Poonamallee-Tiruvallur Rd</span>
        </div>
      `)
      .addTo(map);

    // 2. Setup Bus Marker with Top-down Arrow / Ola-Rapido Vehicle Design
    const busIcon = L.divIcon({
      className: 'rapido-bus-marker',
      html: `
        <div id="bus-vehicle-container" style="
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Pulsing Radar Ring (Rapido / Uber Style) -->
          <div style="
            position: absolute;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.25);
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>

          <!-- Rotating Vehicle Body -->
          <div id="bus-vehicle-body" style="
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #15803d;
            border: 2.5px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${busPosition.bearing}deg);
            transition: transform 0.15s ease-out;
          ">
            <!-- Directional Pointer Arrow -->
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-bottom: 9px solid #fbbf24;
              position: absolute;
              top: 2px;
            "></div>

            <!-- Bus Icon Symbol -->
            <span style="font-size: 17px; margin-top: 2px;">🚌</span>
          </div>

          <!-- Route Badge Tag -->
          <div style="
            position: absolute;
            bottom: -6px;
            background: #0f172a;
            color: #ffffff;
            font-size: 9px;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.2);
          ">
            ${route.routeNumber}
          </div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });

    const busMarker = L.marker([busPosition.lat, busPosition.lng], {
      icon: busIcon,
      zIndexOffset: 1000
    }).addTo(map);

    busMarkerRef.current = busMarker;
    mapRef.current = map;

    // Handle container resize automatically
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      busMarkerRef.current = null;
      routePolylineRef.current = null;
      stopsLayerRef.current = null;
    };
  }, []);

  // Handle Map Type Switch (Google Roadmap vs Google Satellite)
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const googleTileUrl =
      mapType === 'roadmap'
        ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

    tileLayerRef.current.setUrl(googleTileUrl);
  }, [mapType]);

  // Handle Route Path & Stops Rendering
  useEffect(() => {
    const map = mapRef.current;
    const stopsGroup = stopsLayerRef.current;
    if (!map || !stopsGroup) return;

    stopsGroup.clearLayers();

    // 1. Draw Route Polyline with Google Maps Style strictly on roads
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    const roadCoordinates = REAL_ROAD_PATHS[route.id] || route.path;
    if (roadCoordinates && roadCoordinates.length > 1) {
      const polyline = L.polyline(roadCoordinates, {
        color: '#800000',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routePolylineRef.current = polyline;
      // Immediately center and fit viewport to the selected route!
      map.fitBounds(polyline.getBounds(), {
        padding: [40, 40],
        maxZoom: 15
      });
    } else if (busPosition.lat && busPosition.lng) {
      map.setView([busPosition.lat, busPosition.lng], 14);
    }

    // Ensure bus marker is aligned with route position
    if (busMarkerRef.current && busPosition.lat && busPosition.lng) {
      busMarkerRef.current.setLatLng([busPosition.lat, busPosition.lng]);
      const badgeEl = document.getElementById('bus-vehicle-badge');
      if (badgeEl) {
        badgeEl.textContent = route.routeNumber;
      }
    }

    // 2. Render Route Stops
    route.stops.forEach((stop, idx) => {
      const isStudentStop = studentStop && studentStop.name === stop.name;

      const stopIcon = L.divIcon({
        className: 'route-stop-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: ${isStudentStop ? '24px' : '18px'};
              height: ${isStudentStop ? '24px' : '18px'};
              border-radius: 50%;
              background: ${isStudentStop ? '#2563eb' : stop.passed ? '#10b981' : '#ffffff'};
              border: 3px solid ${isStudentStop ? '#ffffff' : stop.passed ? '#059669' : '#800000'};
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${isStudentStop || stop.passed ? '#ffffff' : '#800000'};
              font-size: 9px;
              font-weight: 800;
            ">
              ${isStudentStop ? '📍' : stop.passed ? '✓' : idx + 1}
            </div>

            <div style="
              background: ${isStudentStop ? '#1e40af' : '#ffffff'};
              color: ${isStudentStop ? '#ffffff' : '#1e293b'};
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 2px;
              white-space: nowrap;
              box-shadow: 0 2px 5px rgba(0,0,0,0.15);
              border: ${isStudentStop ? 'none' : '1px solid #e2e8f0'};
            ">
              ${isStudentStop ? `★ Your Stop: ${stop.name}` : stop.name}
            </div>
          </div>
        `,
        iconSize: [24, 40],
        iconAnchor: [12, 12]
      });

      L.marker(stop.location, { icon: stopIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <strong style="color: ${isStudentStop ? '#2563eb' : '#800000'};">
              ${stop.name} ${isStudentStop ? '(Your Designated Boarding Point)' : ''}
            </strong><br/>
            <span>Scheduled Pickup: <b>${stop.time}</b></span><br/>
            <span style="color: ${stop.passed ? '#10b981' : '#f59e0b'}; font-weight: 600;">
              ${stop.passed ? '✓ Bus already passed this stop' : '⏳ Approaching this stop'}
            </span>
          </div>
        `)
        .addTo(stopsGroup);
    });
  }, [route, studentStop]);

  // Handle CONTINUOUS SMOOTH BUS MOVEMENT (60fps animation without page refresh)
  useEffect(() => {
    const marker = busMarkerRef.current;
    const map = mapRef.current;
    if (!marker || !map) return;

    // 1. Smoothly update marker coordinates
    marker.setLatLng([busPosition.lat, busPosition.lng]);

    // 2. Smoothly rotate the vehicle directional pointer using DOM update
    const vehicleEl = document.getElementById('bus-vehicle-body');
    if (vehicleEl) {
      vehicleEl.style.transform = `rotate(${busPosition.bearing}deg)`;
    }

    // 3. Smooth Pan following vehicle like Ola / Rapido if follow mode is active
    if (followBus) {
      map.panTo([busPosition.lat, busPosition.lng], {
        animate: true,
        duration: 0.2
      });
    }
  }, [busPosition.lat, busPosition.lng, busPosition.bearing, followBus]);

  const handleCenterOnBus = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([busPosition.lat, busPosition.lng], 15, { animate: true });
    onToggleFollow?.(true);
  };

  const handleFitFullRoute = () => {
    if (!mapRef.current || !routePolylineRef.current) return;
    onToggleFollow?.(false);
    mapRef.current.fitBounds(routePolylineRef.current.getBounds(), {
      padding: [40, 40],
      maxZoom: 15
    });
  };

  // Render Student Live Device GPS Location if available
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (studentLocation && studentLocation[0] && studentLocation[1]) {
      if (!studentMarkerRef.current) {
        const studentIcon = L.divIcon({
          className: 'student-live-location',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const m = L.marker(studentLocation, { icon: studentIcon, zIndexOffset: 950 }).addTo(map);
        m.bindPopup('<b>You are here</b><br/>Your real device GPS coordinates');
        studentMarkerRef.current = m;
      } else {
        studentMarkerRef.current.setLatLng(studentLocation);
      }
    } else if (studentMarkerRef.current) {
      map.removeLayer(studentMarkerRef.current);
      studentMarkerRef.current = null;
    }
  }, [studentLocation]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-3xl ${className}`}
      style={{ height }}
    >
      {/* Floating Action Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        {/* Center On Bus */}
        <button
          type="button"
          onClick={handleCenterOnBus}
          className={`p-3 rounded-2xl shadow-lg border backdrop-blur transition-all active:scale-90 ${
            followBus
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-white/95 text-slate-700 hover:text-emerald-600 border-slate-200'
          }`}
          title="Center and Track Bus"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* View Entire Route Corridor */}
        <button
          type="button"
          onClick={handleFitFullRoute}
          className="p-3 bg-white/95 hover:bg-white text-slate-700 hover:text-maroon-700 rounded-2xl shadow-lg border border-slate-200 backdrop-blur transition-all active:scale-90"
          title="Fit Entire Route to Screen"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* Google Map Layer Switcher (Roadmap vs Satellite) */}
        <button
          type="button"
          onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
          className="p-3 bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 rounded-2xl shadow-lg border border-slate-200 backdrop-blur transition-all active:scale-90"
          title={`Switch to Google ${mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}`}
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Top Floating Telemetry Pill */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <div className="bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 text-xs font-bold">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              route.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          ></span>
          <span>{route.status === 'active' ? 'Real-Time Satellite GPS' : 'Scheduled Route'}</span>
          <span className="text-slate-400 font-normal">|</span>
          <span className="font-mono text-emerald-300">
            {route.status === 'active' ? `${busPosition.speedKmH || 0} km/h` : '0 km/h'}
          </span>
        </div>
      </div>
    </div>
  );
}
