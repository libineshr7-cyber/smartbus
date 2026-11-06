// Real-time Smooth Continuous Vehicle Movement Engine (Rapido / Ola / Uber Style)
// Computes continuous interpolation, bearing angle rotation, and distance calculations

export interface SimulatedPosition {
  lat: number;
  lng: number;
  bearing: number;
  speedKmH: number;
  progressPercent: number;
  distanceToDestKm: number;
  etaMinutes: number;
}

// Haversine formula to compute distance between two lat/lng in meters
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate compass bearing angle (in degrees 0-360) between two points
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

import { REAL_ROAD_PATHS } from './realRoadData';

export const HIGH_DENSITY_ROUTES = REAL_ROAD_PATHS;

// Cache precomputed cumulative distances for high-density route points
const distanceCache = new Map<[number, number][], { cumulative: number[]; total: number }>();

function getRouteDistances(points: [number, number][]) {
  let cached = distanceCache.get(points);
  if (!cached) {
    const cumulative: number[] = [0];
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const d = getDistanceMeters(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
      total += d;
      cumulative.push(total);
    }
    cached = { cumulative, total };
    distanceCache.set(points, cached);
  }
  return cached;
}

// Interpolate smoothly along high-density points
export function interpolateRoutePosition(
  points: [number, number][],
  progress: number // 0.0 to 1.0
): SimulatedPosition {
  if (!points || points.length === 0) {
    return {
      lat: 13.1332,
      lng: 79.9725,
      bearing: 0,
      speedKmH: 0,
      progressPercent: 100,
      distanceToDestKm: 0,
      etaMinutes: 0
    };
  }

  if (points.length === 1) {
    return {
      lat: points[0][0],
      lng: points[0][1],
      bearing: 0,
      speedKmH: 0,
      progressPercent: 100,
      distanceToDestKm: 0,
      etaMinutes: 0
    };
  }

  const { cumulative, total: totalDistanceMeters } = getRouteDistances(points);

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const targetDistance = clampedProgress * totalDistanceMeters;
  const remainingDistanceMeters = Math.max(0, totalDistanceMeters - targetDistance);
  const remainingKm = remainingDistanceMeters / 1000;

  const baseSpeed = 42;
  const speedVariation = Math.sin(clampedProgress * Math.PI * 4) * 4;
  const currentSpeedKmH = Math.round(baseSpeed + speedVariation);
  const etaMinutes = Math.max(1, Math.round((remainingKm / currentSpeedKmH) * 60));

  // Binary search to find segment
  let low = 0;
  let high = points.length - 2;
  let segIdx = 0;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (cumulative[mid] <= targetDistance) {
      segIdx = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const p1 = points[segIdx];
  const p2 = points[segIdx + 1];
  const segStartDist = cumulative[segIdx];
  const segEndDist = cumulative[segIdx + 1];
  const segLen = segEndDist - segStartDist;

  const segT = segLen > 0 ? (targetDistance - segStartDist) / segLen : 0;
  const lat = p1[0] + (p2[0] - p1[0]) * segT;
  const lng = p1[1] + (p2[1] - p1[1]) * segT;
  const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

  return {
    lat,
    lng,
    bearing,
    speedKmH: currentSpeedKmH,
    progressPercent: Math.round(clampedProgress * 100),
    distanceToDestKm: Number(remainingKm.toFixed(1)),
    etaMinutes
  };

  const lastPoint = points[points.length - 1];
  return {
    lat: lastPoint[0],
    lng: lastPoint[1],
    bearing: 0,
    speedKmH: 0,
    progressPercent: 100,
    distanceToDestKm: 0,
    etaMinutes: 0
  };
}
