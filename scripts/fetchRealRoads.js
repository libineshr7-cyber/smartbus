import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_STOPS = {
  'route-1': [
    [80.1948, 13.0694], // Koyambedu
    [80.1617, 13.0664], // Maduravoyal
    [80.0934, 13.0489], // Poonamallee
    [80.0540, 13.0560], // Nazarathpet
    [80.0070, 13.0617], // Thirumazhisai
    [79.9725, 13.1332]  // PEC Campus
  ],
  'route-2': [
    [80.1000, 12.9249], // Tambaram
    [80.1462, 12.9516], // Chromepet
    [80.1491, 12.9675], // Pallavaram
    [80.1565, 13.0382], // Porur
    [80.1250, 13.0450], // Iyyappanthangal
    [80.0934, 13.0489], // Poonamallee
    [79.9725, 13.1332]  // PEC Campus
  ],
  'route-3': [
    [80.1018, 13.1147], // Avadi
    [80.1548, 13.1143], // Ambattur OT
    [80.1226, 13.0782], // Thiruverkadu
    [80.0934, 13.0489], // Poonamallee
    [79.9725, 13.1332]  // PEC Campus
  ],
  'route-4': [
    [80.1960, 13.1970], // Red Hills
    [80.1780, 13.1480], // Surapet
    [80.2090, 13.1230], // Kolathur
    [80.1650, 13.0900], // Ambattur
    [80.0070, 13.0617], // Thirumazhisai
    [79.9725, 13.1332]  // PEC Campus
  ],
  'route-5': [
    [79.7036, 12.8342], // Kanchipuram
    [79.8650, 12.9350], // Sunguvarchatram
    [79.9442, 12.9675], // Sriperumbudur
    [79.9550, 13.0450], // Mappedu
    [79.9725, 13.1332]  // PEC Campus
  ]
};

function fetchRouteGeometry(waypoints) {
  const coordStr = waypoints.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PECSmartBusApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.routes && json.routes[0]) {
            // OSRM coordinates are [lon, lat]. Convert to Leaflet [lat, lon]
            const leafletCoords = json.routes[0].geometry.coordinates.map(([lon, lat]) => [
              Number(lat.toFixed(6)),
              Number(lon.toFixed(6))
            ]);
            resolve(leafletCoords);
          } else {
            reject(new Error('No route found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching exact asphalt road geometries from OSRM...');
  const result = {};

  for (const [routeId, waypoints] of Object.entries(ROUTES_STOPS)) {
    console.log(`Fetching road for ${routeId}...`);
    try {
      const coords = await fetchRouteGeometry(waypoints);
      console.log(`✓ ${routeId}: ${coords.length} road coordinates`);
      result[routeId] = coords;
    } catch (err) {
      console.error(`Error fetching ${routeId}:`, err.message);
    }
  }

  const outputPath = path.resolve(__dirname, '../src/app/services/realRoadData.ts');
  const fileContent = `// Real-world asphalt road geometries snapped to Chennai & Tiruvallur Highways for PEC Smartbus
// Generated from OpenStreetMap / OSRM Driving Engine

export const REAL_ROAD_PATHS: Record<string, [number, number][]> = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully saved road geometries to ${outputPath}`);
}

main();
