import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Official PEC Routes & Stages from PDF (With effect from 01/09/2026)
export const OFFICIAL_ROUTES_CONFIG = [
  {
    id: 'RNo:36',
    routeNumber: 'RNo:36',
    routeName: 'TAMBARAM Via KUNDRATHUR',
    busNumber: 'TN-20-BZ-4136',
    driver: {
      name: 'R. Venkatesh',
      phone: '+91 98402 34562',
      license: 'TN-11-2018-0418',
      experienceYears: 11
    },
    status: 'active',
    capacity: 55,
    occupancy: 46,
    speedKmH: 42,
    stops: [
      { name: 'Camprod', time: '5:55 AM', location: [12.9150, 80.1400], passed: true },
      { name: 'Tambaram', time: '6:00 AM', location: [12.9249, 80.1200], passed: true },
      { name: 'Chromepet', time: '6:05 AM', location: [12.9516, 80.1462], passed: true },
      { name: 'Pallavaram', time: '6:10 AM', location: [12.9675, 80.1491], passed: true },
      { name: 'Pammal', time: '6:20 AM', location: [12.9730, 80.1340], passed: true },
      { name: 'Kundrathur', time: '6:35 AM', location: [12.9970, 80.0970], passed: false },
      { name: 'Mangadu', time: '6:55 AM', location: [13.0420, 80.1150], passed: false },
      { name: 'Kumananchavadi', time: '7:15 AM', location: [13.0470, 80.0950], passed: false },
      { name: 'College (PEC Campus)', time: '7:25 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [80.1400, 12.9150],
      [80.1200, 12.9249],
      [80.1462, 12.9516],
      [80.1491, 12.9675],
      [80.1340, 12.9730],
      [80.0970, 12.9970],
      [80.1150, 13.0420],
      [80.0950, 13.0470],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:12',
    routeNumber: 'RNo:12',
    routeName: 'PALLIKARANAI Via KILKATTALAI',
    busNumber: 'TN-20-BZ-4112',
    driver: {
      name: 'M. Shanmugam',
      phone: '+91 94441 23451',
      license: 'TN-04-2015-0029',
      experienceYears: 14
    },
    status: 'active',
    capacity: 55,
    occupancy: 49,
    speedKmH: 40,
    stops: [
      { name: 'Medavakkam', time: '5:40 AM', location: [12.9180, 80.1920], passed: true },
      { name: 'Pallikaranai', time: '5:45 AM', location: [12.9380, 80.2150], passed: true },
      { name: 'Velachery', time: '5:55 AM', location: [12.9750, 80.2210], passed: true },
      { name: 'St. Thomas Mount', time: '6:18 AM', location: [13.0030, 80.1980], passed: true },
      { name: 'DLF Ramapuram', time: '6:25 AM', location: [13.0290, 80.1750], passed: true },
      { name: 'Porur', time: '6:35 AM', location: [13.0382, 80.1565], passed: true },
      { name: 'Iyyappanthangal', time: '6:42 AM', location: [13.0450, 80.1250], passed: false },
      { name: 'Kattupakkam', time: '6:45 AM', location: [13.0470, 80.1120], passed: false },
      { name: 'Kumananchavadi', time: '6:50 AM', location: [13.0480, 80.0950], passed: false },
      { name: 'Nazarathpettai', time: '7:05 AM', location: [13.0560, 80.0540], passed: false },
      { name: 'College (PEC Campus)', time: '7:30 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [80.1920, 12.9180],
      [80.2150, 12.9380],
      [80.2210, 12.9750],
      [80.1980, 13.0030],
      [80.1750, 13.0290],
      [80.1565, 13.0382],
      [80.1250, 13.0450],
      [80.0950, 13.0480],
      [80.0540, 13.0560],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:28',
    routeNumber: 'RNo:28',
    routeName: 'MMDA Via TRIPLICANE, PORUR',
    busNumber: 'TN-20-BZ-4128',
    driver: {
      name: 'K. Rajendran',
      phone: '+91 97893 45673',
      license: 'TN-02-2012-0982',
      experienceYears: 12
    },
    status: 'active',
    capacity: 55,
    occupancy: 44,
    speedKmH: 38,
    stops: [
      { name: 'Pudupet', time: '5:30 AM', location: [13.0680, 80.2680], passed: true },
      { name: 'Triplicane', time: '5:32 AM', location: [13.0580, 80.2760], passed: true },
      { name: 'Dr. Radhakrishnan Salai', time: '5:40 AM', location: [13.0420, 80.2600], passed: true },
      { name: 'T. Nagar', time: '6:00 AM', location: [13.0418, 80.2341], passed: true },
      { name: 'Ashok Pillar', time: '6:03 AM', location: [13.0336, 80.2117], passed: true },
      { name: 'Virugambakkam', time: '6:16 AM', location: [13.0510, 80.1920], passed: true },
      { name: 'Valasaravakkam', time: '6:25 AM', location: [13.0450, 80.1750], passed: false },
      { name: 'Porur (Karambakkam)', time: '6:35 AM', location: [13.0382, 80.1565], passed: false },
      { name: 'Poonamallee', time: '6:45 AM', location: [13.0489, 80.0934], passed: false },
      { name: 'College (PEC Campus)', time: '7:30 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [80.2680, 13.0680],
      [80.2760, 13.0580],
      [80.2600, 13.0420],
      [80.2341, 13.0418],
      [80.2117, 13.0336],
      [80.1920, 13.0510],
      [80.1750, 13.0450],
      [80.1565, 13.0382],
      [80.0934, 13.0489],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:31',
    routeNumber: 'RNo:31',
    routeName: 'THIRUVOTRIYUR Via NSK NAGAR',
    busNumber: 'TN-20-BZ-4131',
    driver: {
      name: 'P. Anbalagan',
      phone: '+91 94435 67895',
      license: 'TN-21-2010-0631',
      experienceYears: 16
    },
    status: 'active',
    capacity: 55,
    occupancy: 48,
    speedKmH: 44,
    stops: [
      { name: 'Toll Gate', time: '5:42 AM', location: [13.1350, 80.2950], passed: true },
      { name: 'Mint', time: '6:05 AM', location: [13.1070, 80.2800], passed: true },
      { name: 'Aminjikarai', time: '6:30 AM', location: [13.0730, 80.2220], passed: true },
      { name: 'Koyambedu Metro', time: '6:40 AM', location: [13.0694, 80.1948], passed: true },
      { name: 'Maduravoyal', time: '6:45 AM', location: [13.0664, 80.1617], passed: true },
      { name: 'Velappanchavadi', time: '6:55 AM', location: [13.0550, 80.1220], passed: false },
      { name: 'College (PEC Campus)', time: '7:30 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [80.2950, 13.1350],
      [80.2800, 13.1070],
      [80.2220, 13.0730],
      [80.1948, 13.0694],
      [80.1617, 13.0664],
      [80.1220, 13.0550],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:09',
    routeNumber: 'RNo:09',
    routeName: 'THIRUVERKAADU Via AMBATTUR',
    busNumber: 'TN-20-BZ-4109',
    driver: {
      name: 'S. Murugan',
      phone: '+91 98414 56784',
      license: 'TN-05-2016-1142',
      experienceYears: 9
    },
    status: 'active',
    capacity: 55,
    occupancy: 41,
    speedKmH: 36,
    stops: [
      { name: 'Dunlop', time: '6:40 AM', location: [13.1200, 80.1580], passed: true },
      { name: 'Ambattur OT', time: '6:45 AM', location: [13.1143, 80.1548], passed: true },
      { name: 'Thirumullaivoyal', time: '6:50 AM', location: [13.1230, 80.1320], passed: true },
      { name: 'Avadi', time: '6:55 AM', location: [13.1147, 80.1018], passed: true },
      { name: 'Pattabiram', time: '7:00 AM', location: [13.1190, 80.0650], passed: false },
      { name: 'College (PEC Campus)', time: '7:30 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [80.1580, 13.1200],
      [80.1548, 13.1143],
      [80.1320, 13.1230],
      [80.1018, 13.1147],
      [80.0650, 13.1190],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:5',
    routeNumber: 'RNo:5',
    routeName: 'KANCHIPURAM Via SRI PERUMBUDUR',
    busNumber: 'TN-20-BZ-4105',
    driver: {
      name: 'G. Balaraman',
      phone: '+91 94445 12890',
      license: 'TN-21-2014-0789',
      experienceYears: 15
    },
    status: 'active',
    capacity: 55,
    occupancy: 47,
    speedKmH: 45,
    stops: [
      { name: 'Collector Office', time: '5:30 AM', location: [12.8340, 79.7020], passed: true },
      { name: 'Kanchipurambusstand', time: '5:40 AM', location: [12.8342, 79.7036], passed: true },
      { name: 'Meenakshi Hospital', time: '5:50 AM', location: [12.8620, 79.7350], passed: true },
      { name: 'Sungavachitram', time: '6:05 AM', location: [12.9350, 79.8650], passed: true },
      { name: 'Sri perambudur', time: '6:20 AM', location: [12.9675, 79.9442], passed: true },
      { name: 'Chenkadu', time: '6:35 AM', location: [13.0200, 79.9480], passed: false },
      { name: 'Polivakkam', time: '6:40 AM', location: [13.0650, 79.9480], passed: false },
      { name: 'Manaval nagar', time: '7:00 AM', location: [13.1150, 79.9350], passed: false },
      { name: 'College (PEC Campus)', time: '7:25 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [79.7036, 12.8342],
      [79.7350, 12.8620],
      [79.8650, 12.9350],
      [79.9442, 12.9675],
      [79.9480, 13.0200],
      [79.9480, 13.0650],
      [79.9350, 13.1150],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:1',
    routeNumber: 'RNo:1',
    routeName: 'PALAVAKKAM Via UTHUKOTTAI',
    busNumber: 'TN-20-BZ-4101',
    driver: {
      name: 'V. Sundaram',
      phone: '+91 98403 67812',
      license: 'TN-20-2016-0345',
      experienceYears: 10
    },
    status: 'active',
    capacity: 55,
    occupancy: 38,
    speedKmH: 38,
    stops: [
      { name: 'Palavakkam', time: '6:00 AM', location: [13.3100, 79.9100], passed: true },
      { name: 'Uthukottai', time: '6:10 AM', location: [13.3280, 79.9050], passed: true },
      { name: 'Katchur', time: '6:25 AM', location: [13.2350, 79.9020], passed: true },
      { name: 'Thiruvallur', time: '6:55 AM', location: [13.1430, 79.9080], passed: false },
      { name: 'College (PEC Campus)', time: '7:30 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [79.9100, 13.3100],
      [79.9050, 13.3280],
      [79.9020, 13.2350],
      [79.9080, 13.1430],
      [79.9725, 13.1332]
    ]
  },
  {
    id: 'RNo:13',
    routeNumber: 'RNo:13',
    routeName: 'THANDALAM - THIRUMALISAI',
    busNumber: 'TN-20-BZ-4113',
    driver: {
      name: 'D. Elumalai',
      phone: '+91 97891 23489',
      license: 'TN-10-2017-0912',
      experienceYears: 8
    },
    status: 'active',
    capacity: 55,
    occupancy: 42,
    speedKmH: 40,
    stops: [
      { name: 'Thandalam', time: '6:50 AM', location: [13.0350, 80.0250], passed: true },
      { name: 'Chembarambakkam', time: '7:00 AM', location: [13.0280, 80.0580], passed: true },
      { name: 'Thiumalisai-Juncation', time: '7:10 AM', location: [13.0550, 80.0150], passed: true },
      { name: 'Vellavedu', time: '7:15 AM', location: [13.0720, 79.9980], passed: false },
      { name: 'Nemam', time: '7:17 AM', location: [13.0850, 79.9920], passed: false },
      { name: 'Puduchatram', time: '7:20 AM', location: [13.1050, 79.9820], passed: false },
      { name: 'College (PEC Campus)', time: '7:30 AM', location: [13.1332, 79.9725], passed: false }
    ],
    waypoints: [
      [80.0250, 13.0350],
      [80.0580, 13.0280],
      [80.0150, 13.0550],
      [79.9980, 13.0720],
      [79.9920, 13.0850],
      [79.9820, 13.1050],
      [79.9725, 13.1332]
    ]
  }
];

function fetchRouteGeometry(waypoints) {
  const coordStr = waypoints.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PECSmartBusApp/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.routes && json.routes[0]) {
            const leafletCoords = json.routes[0].geometry.coordinates.map(([lon, lat]) => [
              Number(lat.toFixed(6)),
              Number(lon.toFixed(6))
            ]);
            resolve(leafletCoords);
          } else {
            reject(new Error('No route returned by OSRM'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function build() {
  console.log('Fetching OSRM road geometry for all official PDF routes...');
  const roadPaths = {};

  for (const cfg of OFFICIAL_ROUTES_CONFIG) {
    console.log(`Processing ${cfg.routeNumber} (${cfg.routeName})...`);
    try {
      const coords = await fetchRouteGeometry(cfg.waypoints);
      console.log(`✓ ${cfg.routeNumber}: ${coords.length} street road coordinates`);
      roadPaths[cfg.id] = coords;
      // also alias for backwards-compat
      roadPaths[cfg.id.toLowerCase().replace(':', '')] = coords;
      roadPaths[`route-${cfg.id.replace('RNo:', '')}`] = coords;
    } catch (e) {
      console.error(`Failed ${cfg.routeNumber}:`, e.message);
    }
  }

  // Write realRoadData.ts
  const roadDataFile = path.resolve(__dirname, '../src/app/services/realRoadData.ts');
  fs.writeFileSync(
    roadDataFile,
    `// Real-world asphalt road geometries from official Prathyusha Engineering College PDF (2026)
// Fetched from OSRM street-by-street driving engine

export const REAL_ROAD_PATHS: Record<string, [number, number][]> = ${JSON.stringify(roadPaths, null, 2)};
`,
    'utf-8'
  );
  console.log(`Saved road paths to ${roadDataFile}`);

  // Write official routes into busData.ts
  console.log('Generating updated busData.ts...');
  const busDataPath = path.resolve(__dirname, '../src/app/services/busData.ts');
  
  const formattedRoutes = OFFICIAL_ROUTES_CONFIG.map(r => ({
    id: r.id,
    routeNumber: r.routeNumber,
    routeName: r.routeName,
    busNumber: r.busNumber,
    driver: r.driver,
    status: r.status,
    capacity: r.capacity,
    occupancy: r.occupancy,
    speedKmH: r.speedKmH,
    stops: r.stops,
    currentLocation: r.stops[Math.floor(r.stops.length / 2)].location,
    path: roadPaths[r.id] || [],
    currentStopIndex: Math.floor(r.stops.length / 2),
    nextStop: r.stops[Math.floor(r.stops.length / 2) + 1]?.name || 'PEC Campus Gate',
    etaMinutes: 14,
    lastUpdated: 'Live GPS active'
  }));

  const busDataContent = `// Prathyusha Engineering College - Smart Bus Central State Management
// Official 2026 Routes & Boarding Points from PEC Transport PDF
import { REAL_ROAD_PATHS } from './realRoadData';

export interface BusStop {
  name: string;
  time: string;
  location: [number, number];
  passed: boolean;
}

export interface DriverInfo {
  name: string;
  phone: string;
  license: string;
  experienceYears: number;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  busNumber: string;
  driver: DriverInfo;
  status: 'active' | 'scheduled' | 'completed' | 'maintenance';
  capacity: number;
  occupancy: number;
  speedKmH: number;
  stops: BusStop[];
  currentLocation: [number, number];
  path: [number, number][];
  currentStopIndex: number;
  nextStop: string;
  etaMinutes: number;
  lastUpdated: string;
}

export interface SOSAlert {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  year: string;
  phone: string;
  routeId: string;
  location: [number, number];
  locationName: string;
  timestamp: string;
  status: 'pending' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  timestamp: string;
  postedBy: string;
}

export const PEC_CAMPUS: [number, number] = [13.1332, 79.9725];

export const INITIAL_ROUTES: BusRoute[] = ${JSON.stringify(formattedRoutes, null, 2)};

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'PEC Transport Timing Schedule 2026',
    message: 'All college transport buses operate strictly as per stage-wise boarding point timings with effect from 01/09/2026.',
    type: 'info',
    timestamp: 'Today, 06:00 AM',
    postedBy: 'PEC Transport In-Charge'
  },
  {
    id: 'ann-2',
    title: 'Campus Arrival Protocol',
    message: 'All buses scheduled to report at PEC Campus between 07:25 AM and 07:30 AM.',
    type: 'info',
    timestamp: 'Today, 06:15 AM',
    postedBy: 'Transport Desk'
  }
];

const STORAGE_KEYS = {
  ROUTES: 'pec_smartbus_routes_official_v2',
  SOS_ALERTS: 'pec_smartbus_sos_alerts_v2',
  ANNOUNCEMENTS: 'pec_smartbus_announcements_v2'
};

class BusStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
          this.notify();
        }
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying bus store listener', err);
      }
    });
  }

  public getRoutes(): BusRoute[] {
    if (typeof window === 'undefined') {
      return INITIAL_ROUTES.map(r => ({ ...r, path: REAL_ROAD_PATHS[r.id] || r.path }));
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTES);
    if (!raw) {
      const init = INITIAL_ROUTES.map(r => ({ ...r, path: REAL_ROAD_PATHS[r.id] || r.path }));
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(init));
      return init;
    }
    try {
      const parsed: BusRoute[] = JSON.parse(raw);
      return parsed.map((r) => ({
        ...r,
        path: REAL_ROAD_PATHS[r.id] && REAL_ROAD_PATHS[r.id].length > 0 ? REAL_ROAD_PATHS[r.id] : r.path
      }));
    } catch {
      return INITIAL_ROUTES.map(r => ({ ...r, path: REAL_ROAD_PATHS[r.id] || r.path }));
    }
  }

  public getRouteById(id: string): BusRoute | undefined {
    return this.getRoutes().find((r) => r.id === id);
  }

  public saveRoutes(routes: BusRoute[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
    this.notify();
  }

  public startTrip(routeId: string, driverName?: string, phone?: string): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx].status = 'active';
      if (driverName) routes[idx].driver.name = driverName;
      if (phone) routes[idx].driver.phone = phone;
      routes[idx].speedKmH = 40;
      routes[idx].lastUpdated = 'Trip started just now';
      this.saveRoutes(routes);
    }
  }

  public stopTrip(routeId: string): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx].status = 'completed';
      routes[idx].speedKmH = 0;
      routes[idx].lastUpdated = 'Trip completed';
      this.saveRoutes(routes);
    }
  }

  public updateBusLocation(routeId: string, newLocation: [number, number], speed?: number): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx].currentLocation = newLocation;
      if (typeof speed === 'number') routes[idx].speedKmH = speed;
      routes[idx].lastUpdated = 'Updated just now';
      this.saveRoutes(routes);
    }
  }

  public getSOSAlerts(): SOSAlert[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEYS.SOS_ALERTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public triggerSOS(alert: Omit<SOSAlert, 'id' | 'timestamp' | 'status'>): SOSAlert {
    const alerts = this.getSOSAlerts();
    const newAlert: SOSAlert = {
      ...alert,
      id: \`sos-\${Date.now()}\`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'pending'
    };
    alerts.unshift(newAlert);
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(alerts));
    this.notify();
    return newAlert;
  }

  public resolveSOS(alertId: string, adminNotes?: string): void {
    const alerts = this.getSOSAlerts();
    const idx = alerts.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      alerts[idx].status = 'resolved';
      alerts[idx].resolvedAt = new Date().toLocaleTimeString();
      alerts[idx].resolvedBy = adminNotes || 'PEC Central Admin';
      localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(alerts));
      this.notify();
    }
  }

  public getAnnouncements(): Announcement[] {
    if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  public addAnnouncement(title: string, message: string, type: 'info' | 'warning' | 'urgent'): void {
    const list = this.getAnnouncements();
    const newAnn: Announcement = {
      id: \`ann-\${Date.now()}\`,
      title,
      message,
      type,
      timestamp: 'Just now',
      postedBy: 'Admin Control'
    };
    list.unshift(newAnn);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    this.notify();
  }
}

export const busStore = new BusStore();
`;

  fs.writeFileSync(busDataPath, busDataContent, 'utf-8');
  console.log(`Saved official bus routes to ${busDataPath}`);
}

build();
