import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BusRoute, SOSAlert, PEC_CAMPUS } from '../services/busData';
import { REAL_ROAD_PATHS } from '../services/realRoadData';
import { Locate, Maximize2, Layers } from 'lucide-react';

interface RealLeafletMapProps {
  routes: BusRoute[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  studentLocation?: [number, number];
  studentPickupStop?: string;
  sosAlerts?: SOSAlert[];
  className?: string;
  height?: string;
}

export default function RealLeafletMap({
  routes,
  selectedRouteId,
  onSelectRoute,
  studentLocation,
  studentPickupStop,
  sosAlerts = [],
  className = '',
  height = '100%'
}: RealLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Default center near Chennai / Poonamallee / PEC Campus
    const initialCenter: [number, number] = [13.0800, 80.0800];

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Zoom control in bottom right for touch ergonomics
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution control small in corner
    L.control.attribution({ position: 'bottomleft', prefix: '© OpenStreetMap' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    // Handle container resize automatically
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      layersGroupRef.current = null;
    };
  }, []);

  // Update map layers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !layerGroup || !mapReady) return;

    layerGroup.clearLayers();

    // 1. Render PEC Main Campus Marker
    const campusIcon = L.divIcon({
      className: 'custom-pec-marker',
      html: `
        <div style="
          background: #800000;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 4px 12px rgba(128,0,0,0.5);
          border: 3px solid #ffffff;
        ">
          PEC
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    L.marker(PEC_CAMPUS, { icon: campusIcon })
      .bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong style="color: #800000; font-size: 14px;">Prathyusha Engineering College</strong><br/>
          <span>Main Campus Gate & Bus Terminal</span><br/>
          <span style="color: #64748b; font-size: 11px;">Aranvoyalkuppam, Chennai-Tiruvallur Road</span>
        </div>
      `)
      .addTo(layerGroup);

    let activeBounds: L.LatLngBounds | null = null;

    // 2. Render Routes & Buses
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const isActive = route.status === 'active';

      // Polyline strictly snapped to asphalt roads
      const roadCoords = REAL_ROAD_PATHS[route.id] || route.path;
      if (roadCoords && roadCoords.length > 1) {
        const polyline = L.polyline(roadCoords, {
          color: isSelected ? '#800000' : isActive ? '#2563eb' : '#94a3b8',
          weight: isSelected ? 5 : isActive ? 4 : 2.5,
          opacity: isSelected ? 0.9 : isActive ? 0.75 : 0.45,
          dashArray: isActive ? undefined : '4, 8'
        }).addTo(layerGroup);

        if (isSelected) {
          activeBounds = polyline.getBounds();
        }
      }

      // Render Stop Markers for selected route
      if (isSelected && route.stops) {
        route.stops.forEach((stop, idx) => {
          const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: `
              <div style="
                background: ${stop.passed ? '#10b981' : '#ffffff'};
                border: 2px solid ${stop.passed ? '#059669' : '#800000'};
                color: ${stop.passed ? '#ffffff' : '#800000'};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 700;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
              ">
                ${idx + 1}
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker(stop.location, { icon: stopIcon })
            .bindPopup(`
              <div style="font-family: inherit; font-size: 12px;">
                <strong>${stop.name}</strong><br/>
                <span>Scheduled: <b>${stop.time}</b></span><br/>
                <span style="color: ${stop.passed ? '#10b981' : '#f59e0b'}; font-weight: 600;">
                  ${stop.passed ? '✓ Bus already passed' : '⏳ Upcoming stop'}
                </span>
              </div>
            `)
            .addTo(layerGroup);
        });
      }

      // Render Bus Marker
      const busMarkerColor = isActive ? '#16a34a' : '#64748b';
      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isActive ? `
              <div style="
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(22, 163, 74, 0.25);
                top: -5px;
                left: -5px;
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            ` : ''}
            <div style="
              background: ${busMarkerColor};
              color: white;
              width: 34px;
              height: 34px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              border: 2px solid white;
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              🚌
            </div>
            <div style="
              background: #1e293b;
              color: white;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 3px;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${route.routeNumber}
            </div>
          </div>
        `,
        iconSize: [34, 52],
        iconAnchor: [17, 30]
      });

      const busMarker = L.marker(route.currentLocation, { icon: busIcon })
        .addTo(layerGroup)
        .on('click', () => {
          onSelectRoute?.(route.id);
        });

      busMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #800000; font-size: 13px;">${route.routeNumber}</strong>
            <span style="
              background: ${isActive ? '#dcfce7' : '#f1f5f9'};
              color: ${isActive ? '#15803d' : '#64748b'};
              font-size: 10px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
            ">
              ${isActive ? '● LIVE' : 'SCHEDULED'}
            </span>
          </div>
          <p style="margin: 2px 0; color: #334155;"><b>Bus:</b> ${route.busNumber}</p>
          <p style="margin: 2px 0; color: #334155;"><b>Driver:</b> ${route.driver.name} (${route.driver.phone})</p>
          <p style="margin: 2px 0; color: #334155;"><b>Speed:</b> ${route.speedKmH} km/h</p>
          <p style="margin: 2px 0; color: #334155;"><b>Next:</b> ${route.nextStop} (~${route.etaMinutes} mins)</p>
        </div>
      `);
    });

    // 3. Render Student Location (if provided)
    if (studentLocation) {
      const studentIcon = L.divIcon({
        className: 'custom-student-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              background: #2563eb;
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              box-shadow: 0 4px 10px rgba(37,99,235,0.4);
              border: 2px solid white;
            ">
              📍
            </div>
            <div style="
              background: #2563eb;
              color: white;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 2px;
              white-space: nowrap;
            ">
              Your Stop
            </div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 26]
      });

      L.marker(studentLocation, { icon: studentIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <strong style="color: #2563eb;">Your Designated Stop</strong><br/>
            <span>${studentPickupStop || 'Assigned Boarding Point'}</span>
          </div>
        `)
        .addTo(layerGroup);
    }

    // 4. Render SOS Emergency Alerts (if any)
    sosAlerts.filter(a => a.status === 'pending').forEach((alert) => {
      const sosIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(220, 38, 38, 0.4);
              top: -6px;
              left: -6px;
              animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              background: #dc2626;
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(220,38,38,0.6);
              border: 2px solid white;
            ">
              🚨
            </div>
            <div style="
              background: #991b1b;
              color: white;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 2px;
              white-space: nowrap;
            ">
              SOS: ${alert.studentName}
            </div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 26]
      });

      L.marker(alert.location, { icon: sosIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #991b1b;">
            <strong style="font-size: 13px;">EMERGENCY SOS ALERT</strong><br/>
            <span><b>Student:</b> ${alert.studentName} (${alert.studentId})</span><br/>
            <span><b>Dept:</b> ${alert.department}</span><br/>
            <span><b>Phone:</b> ${alert.phone}</span><br/>
            <span><b>Time:</b> ${alert.timestamp}</span><br/>
            <span><b>Location:</b> ${alert.locationName}</span>
          </div>
        `)
        .addTo(layerGroup);
    });

    // Auto fit to selected route or all markers
    if (activeBounds && (activeBounds as L.LatLngBounds).isValid()) {
      map.fitBounds(activeBounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [routes, selectedRouteId, studentLocation, studentPickupStop, sosAlerts, mapReady, onSelectRoute]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(PEC_CAMPUS, 12, { animate: true });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 ${className}`} style={{ height }}>
      {/* Map Target Container */}
      <div ref={containerRef} className="w-full h-full min-h-[300px]" />

      {/* Floating Action Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 hover:bg-white text-slate-700 hover:text-maroon-700 rounded-xl shadow-md border border-slate-200 backdrop-blur transition-all active:scale-95"
          title="Recenter to PEC Campus"
          type="button"
        >
          <Locate className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600 font-medium">Live Bus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span className="text-slate-600 font-medium">Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-maroon-700"></span>
          <span className="text-slate-600 font-medium">PEC Campus</span>
        </div>
      </div>
    </div>
  );
}
