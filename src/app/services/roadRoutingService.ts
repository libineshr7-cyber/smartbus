// Real-time Road Routing Service for Prathyusha Engineering College Fleet
// Connects to OSRM driving engine to calculate asphalt road geometry on Google Maps
import { BusStop, PEC_CAMPUS } from './busData';
import { REAL_ROAD_PATHS } from './realRoadData';

const memoryRouteCache = new Map<string, [number, number][]>();

/**
 * Fetch real street-by-street driving road geometry for a given set of stops
 * Returns array of [latitude, longitude] coordinates following real roads on Google Maps
 */
export async function fetchRealRoadPath(
  stops: BusStop[],
  routeId?: string
): Promise<[number, number][]> {
  // 1. Check pre-computed REAL_ROAD_PATHS first
  if (routeId && REAL_ROAD_PATHS[routeId] && REAL_ROAD_PATHS[routeId].length > 10) {
    return REAL_ROAD_PATHS[routeId];
  }

  // 2. Check memory cache
  if (routeId && memoryRouteCache.has(routeId)) {
    return memoryRouteCache.get(routeId)!;
  }

  if (!stops || stops.length === 0) return [PEC_CAMPUS];
  if (stops.length === 1) return [stops[0].location, PEC_CAMPUS];

  // 3. Query OSRM Driving Engine for real-world street geometry
  try {
    const coordsStr = stops
      .map((s) => `${s.location[1].toFixed(5)},${s.location[0].toFixed(5)}`)
      .join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PECSmartBus-Browser/1.0' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
        // Convert [longitude, latitude] to [latitude, longitude]
        const points: [number, number][] = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [Number(c[1].toFixed(6)), Number(c[0].toFixed(6))]
        );
        if (routeId) {
          memoryRouteCache.set(routeId, points);
          REAL_ROAD_PATHS[routeId] = points;
        }
        return points;
      }
    }
  } catch (err) {
    console.warn('Dynamic OSRM road routing unavailable, using stop locations:', err);
  }

  // Fallback: return stop locations
  const fallback = stops.map((s) => s.location);
  if (routeId) memoryRouteCache.set(routeId, fallback);
  return fallback;
}
