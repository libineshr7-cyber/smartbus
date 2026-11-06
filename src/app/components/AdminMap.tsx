import { useRef, useState } from 'react';

interface Bus {
  id: number;
  route: string;
  driver: string;
  location: { lat: number; lng: number };
  status: string;
  students: number;
}

interface Alert {
  id: number;
  studentName: string;
  studentId: string;
  location: { lat: number; lng: number };
}

interface AdminMapProps {
  buses: Bus[];
  sosAlerts: Alert[];
  style?: React.CSSProperties;
}

export default function AdminMap({ buses, sosAlerts, style }: AdminMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<Bus | Alert | null>(null);

  const latToY = (lat: number, mapHeight: number) => {
    const latRange = 0.15;
    const centerLat = 13.0650;
    const y = ((centerLat - lat) / latRange) * mapHeight + mapHeight / 2;
    return Math.max(0, Math.min(mapHeight, y));
  };

  const lngToX = (lng: number, mapWidth: number) => {
    const lngRange = 0.2;
    const centerLng = 80.2400;
    const x = ((lng - centerLng) / lngRange) * mapWidth + mapWidth / 2;
    return Math.max(0, Math.min(mapWidth, x));
  };

  return (
    <div ref={mapRef} className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={style}>
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        <svg className="w-full h-full opacity-20">
          <defs>
            <pattern id="admin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-grid)" />
        </svg>
      </div>

      {/* Roads */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
      </svg>

      {/* Bus Markers */}
      {buses.filter(bus => bus.status === 'active').map((bus) => {
        const mapWidth = mapRef.current?.offsetWidth || 800;
        const mapHeight = mapRef.current?.offsetHeight || 600;
        const x = lngToX(bus.location.lng, mapWidth);
        const y = latToY(bus.location.lat, mapHeight);

        return (
          <div
            key={`bus-${bus.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110"
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => setSelectedItem(bus)}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white bg-green-600">
                🚌
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
              {bus.route}
            </div>
          </div>
        );
      })}

      {/* SOS Alert Markers */}
      {sosAlerts.map((alert) => {
        const mapWidth = mapRef.current?.offsetWidth || 800;
        const mapHeight = mapRef.current?.offsetHeight || 600;
        const x = lngToX(alert.location.lng, mapWidth);
        const y = latToY(alert.location.lat, mapHeight);

        return (
          <div
            key={`alert-${alert.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110"
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => setSelectedItem(alert)}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white bg-red-600 animate-pulse">
                🚨
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-red-100 px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap border border-red-300">
              SOS Alert
            </div>
          </div>
        );
      })}

      {/* Info Popup */}
      {selectedItem && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-10">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          {'route' in selectedItem ? (
            <>
              <div className="text-2xl mb-2">🚌</div>
              <h3 className="font-bold text-lg mb-1">{selectedItem.route}</h3>
              <p className="text-sm text-gray-600">Driver: {selectedItem.driver}</p>
              <p className="text-sm text-gray-600">Students: {selectedItem.students}</p>
              <p className="text-sm text-gray-600">Status: {selectedItem.status}</p>
              <div className="text-xs text-gray-500 mt-2">
                📍 {selectedItem.location.lat.toFixed(6)}, {selectedItem.location.lng.toFixed(6)}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl mb-2">🚨</div>
              <h3 className="font-bold text-lg mb-1 text-red-600">SOS Alert</h3>
              <p className="text-sm text-gray-600">{selectedItem.studentName}</p>
              <p className="text-sm text-gray-600">ID: {selectedItem.studentId}</p>
              <div className="text-xs text-gray-500 mt-2">
                📍 {selectedItem.location.lat.toFixed(6)}, {selectedItem.location.lng.toFixed(6)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button className="block w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center font-bold">
          +
        </button>
        <button className="block w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center font-bold">
          −
        </button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-80 px-2 py-1 rounded">
        PEC Admin Monitoring
      </div>
    </div>
  );
}
