import { useEffect, useRef, useState } from 'react';

interface Bus {
  id: number;
  route: string;
  driver: string;
  location: { lat: number; lng: number };
  status: string;
  eta: number | null;
}

interface CustomMapProps {
  center: [number, number];
  buses: Bus[];
  studentLocation: { lat: number; lng: number };
  selectedBus: Bus;
  zoom?: number;
  style?: React.CSSProperties;
}

export default function CustomMap({ center, buses, studentLocation, selectedBus, zoom = 13, style }: CustomMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<Bus | null>(null);

  const latToY = (lat: number, mapHeight: number) => {
    const latRange = 0.1; // Approximate lat range for zoom level
    const centerLat = center[0];
    const y = ((centerLat - lat) / latRange) * mapHeight + mapHeight / 2;
    return Math.max(0, Math.min(mapHeight, y));
  };

  const lngToX = (lng: number, mapWidth: number) => {
    const lngRange = 0.15; // Approximate lng range for zoom level
    const centerLng = center[1];
    const x = ((lng - centerLng) / lngRange) * mapWidth + mapWidth / 2;
    return Math.max(0, Math.min(mapWidth, x));
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'bus':
        return '#16a34a';
      case 'student':
        return '#3b82f6';
      case 'alert':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'bus':
        return '🚌';
      case 'student':
        return '👤';
      case 'alert':
        return '🚨';
      default:
        return '📍';
    }
  };

  return (
    <div ref={mapRef} className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: style?.height || '500px' }}>
      {/* Map Background with Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        <svg className="w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Roads/Routes overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Main roads */}
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
      </svg>

      {/* Markers */}
      {buses.map((bus, index) => {
        const mapWidth = mapRef.current?.offsetWidth || 800;
        const mapHeight = mapRef.current?.offsetHeight || 500;
        const x = lngToX(bus.location.lng, mapWidth);
        const y = latToY(bus.location.lat, mapHeight);

        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110"
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => setSelectedMarker(bus)}
          >
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white"
                style={{ backgroundColor: getMarkerColor('bus') }}
              >
                {getMarkerIcon('bus')}
              </div>
              {bus.status === 'moving' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            
            {/* Marker Label */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
              {bus.route}
            </div>
          </div>
        );
      })}

      {/* Student Marker */}
      {studentLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110"
          style={{ left: `${lngToX(studentLocation.lng, mapRef.current?.offsetWidth || 800)}px`, top: `${latToY(studentLocation.lat, mapRef.current?.offsetHeight || 500)}px` }}
          onClick={() => setSelectedMarker(null)}
        >
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white"
              style={{ backgroundColor: getMarkerColor('student') }}
            >
              {getMarkerIcon('student')}
            </div>
          </div>
          
          {/* Marker Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
            Student
          </div>
        </div>
      )}

      {/* Info Popup */}
      {selectedMarker && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-10">
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <div className="text-2xl mb-2">{getMarkerIcon('bus')}</div>
          <h3 className="font-bold text-lg mb-1">{selectedMarker.route}</h3>
          <p className="text-sm text-gray-600">Driver: {selectedMarker.driver}</p>
          <p className="text-sm text-gray-600">Status: {selectedMarker.status}</p>
          {selectedMarker.eta && (
            <p className="text-sm text-gray-600">ETA: {selectedMarker.eta} mins</p>
          )}
          <div className="text-xs text-gray-500 mt-2">
            📍 {selectedMarker.location.lat.toFixed(6)}, {selectedMarker.location.lng.toFixed(6)}
          </div>
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
        PEC Smart Tracking Map
      </div>
    </div>
  );
}