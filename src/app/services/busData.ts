// Prathyusha Engineering College - Smart Bus Central State Management
// Official 2026 Routes & Boarding Points from PEC Transport Schedule (32 Stage-Wise Routes)
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
  heading?: number;
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

export function buildRoutePath(stops: BusStop[], routeId?: string): [number, number][] {
  if (routeId && REAL_ROAD_PATHS[routeId] && REAL_ROAD_PATHS[routeId].length > 0) {
    return REAL_ROAD_PATHS[routeId];
  }
  if (!stops || stops.length === 0) return [PEC_CAMPUS];
  if (stops.length === 1) return [stops[0].location, PEC_CAMPUS];

  const path: [number, number][] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i].location;
    const s2 = stops[i + 1].location;
    const steps = 14;
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      const lat = Number((s1[0] + (s2[0] - s1[0]) * t).toFixed(6));
      const lng = Number((s1[1] + (s2[1] - s1[1]) * t).toFixed(6));
      path.push([lat, lng]);
    }
  }
  path.push(stops[stops.length - 1].location);
  return path;
}

export const INITIAL_ROUTES: BusRoute[] = [
  {
    "id": "RNo:1",
    "routeNumber": "RNo:1",
    "routeName": "PALAVAKKAM Via UTHUKOTTAI",
    "busNumber": "TN-20-BZ-4101",
    "driver": {
      "name": "K. Murugan",
      "phone": "+91 94441 55001",
      "license": "TN-20-2016-0101",
      "experienceYears": 12
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 48,
    "speedKmH": 42,
    "stops": [
      {
        "name": "Thandalam",
        "time": "5:50 AM",
        "location": [
          13.308,
          79.92
        ],
        "passed": true
      },
      {
        "name": "Palavakkam",
        "time": "6:00 AM",
        "location": [
          13.315,
          79.914
        ],
        "passed": true
      },
      {
        "name": "Tharatchi",
        "time": "6:05 AM",
        "location": [
          13.322,
          79.908
        ],
        "passed": true
      },
      {
        "name": "Alangkadu",
        "time": "6:07 AM",
        "location": [
          13.33,
          79.902
        ],
        "passed": true
      },
      {
        "name": "Uthukottai",
        "time": "6:10 AM",
        "location": [
          13.337,
          79.896
        ],
        "passed": true
      },
      {
        "name": "Pondavakkam",
        "time": "6:20 AM",
        "location": [
          13.285,
          79.91
        ],
        "passed": true
      },
      {
        "name": "Katchur",
        "time": "6:25 AM",
        "location": [
          13.235,
          79.925
        ],
        "passed": true
      },
      {
        "name": "Thiruvallur",
        "time": "6:55 AM",
        "location": [
          13.143,
          79.907
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.143,
      79.907
    ],
    "path": [],
    "currentStopIndex": 7,
    "nextStop": "Thiruvallur",
    "etaMinutes": 20,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:2",
    "routeNumber": "RNo:2",
    "routeName": "PENNALURPET - POONDI",
    "busNumber": "TN-20-BZ-4102",
    "driver": {
      "name": "S. Rajendran",
      "phone": "+91 94442 55002",
      "license": "TN-20-2015-0102",
      "experienceYears": 14
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 45,
    "speedKmH": 40,
    "stops": [
      {
        "name": "Pennalurpet",
        "time": "5:50 AM",
        "location": [
          13.25,
          79.79
        ],
        "passed": true
      },
      {
        "name": "Goonipalyam",
        "time": "6:00 AM",
        "location": [
          13.235,
          79.815
        ],
        "passed": true
      },
      {
        "name": "Kollapalayam",
        "time": "6:10 AM",
        "location": [
          13.22,
          79.835
        ],
        "passed": true
      },
      {
        "name": "Seethanjeri",
        "time": "6:25 AM",
        "location": [
          13.205,
          79.855
        ],
        "passed": true
      },
      {
        "name": "Oddappai",
        "time": "6:35 AM",
        "location": [
          13.185,
          79.87
        ],
        "passed": true
      },
      {
        "name": "Poondi",
        "time": "6:40 AM",
        "location": [
          13.183,
          79.86
        ],
        "passed": false
      },
      {
        "name": "Pullarambakkam",
        "time": "6:45 AM",
        "location": [
          13.158,
          79.89
        ],
        "passed": false
      },
      {
        "name": "Sriniketan School",
        "time": "6:55 AM",
        "location": [
          13.148,
          79.902
        ],
        "passed": false
      },
      {
        "name": "Statebank (Thiruvallur)",
        "time": "7:10 AM",
        "location": [
          13.14,
          79.908
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.183,
      79.86
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "Poondi",
    "etaMinutes": 29,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:03",
    "routeNumber": "RNo:03",
    "routeName": "POONGANAGAR",
    "busNumber": "TN-20-BZ-4103",
    "driver": {
      "name": "P. Selvam",
      "phone": "+91 94443 55003",
      "license": "TN-20-2018-0103",
      "experienceYears": 9
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 42,
    "speedKmH": 38,
    "stops": [
      {
        "name": "Collector Office",
        "time": "6:45 AM",
        "location": [
          13.138,
          79.91
        ],
        "passed": true
      },
      {
        "name": "Poonganagar",
        "time": "6:50 AM",
        "location": [
          13.135,
          79.922
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.135,
      79.922
    ],
    "path": [],
    "currentStopIndex": 1,
    "nextStop": "Poonganagar",
    "etaMinutes": 20,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:04",
    "routeNumber": "RNo:04",
    "routeName": "THAKKOLAM-MAPPEDU",
    "busNumber": "TN-20-BZ-4104",
    "driver": {
      "name": "V. Anand",
      "phone": "+91 94444 55004",
      "license": "TN-20-2017-0104",
      "experienceYears": 11
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 49,
    "speedKmH": 44,
    "stops": [
      {
        "name": "Thakkolam",
        "time": "5:45 AM",
        "location": [
          13.02,
          79.68
        ],
        "passed": true
      },
      {
        "name": "Kesavaram",
        "time": "5:50 AM",
        "location": [
          13.032,
          79.715
        ],
        "passed": true
      },
      {
        "name": "Marimangalam",
        "time": "5:55 AM",
        "location": [
          13.038,
          79.735
        ],
        "passed": true
      },
      {
        "name": "Narsingapuram",
        "time": "6:05 AM",
        "location": [
          13.045,
          79.755
        ],
        "passed": true
      },
      {
        "name": "Perambakkam",
        "time": "6:10 AM",
        "location": [
          13.055,
          79.785
        ],
        "passed": true
      },
      {
        "name": "Kondanchary",
        "time": "6:15 AM",
        "location": [
          13.065,
          79.815
        ],
        "passed": true
      },
      {
        "name": "Mappedu",
        "time": "6:20 AM",
        "location": [
          13.072,
          79.845
        ],
        "passed": true
      },
      {
        "name": "Pannur",
        "time": "6:30 AM",
        "location": [
          13.078,
          79.875
        ],
        "passed": false
      },
      {
        "name": "Katukoturoad",
        "time": "6:45 AM",
        "location": [
          13.085,
          79.905
        ],
        "passed": false
      },
      {
        "name": "Papparambakkam",
        "time": "7:00 AM",
        "location": [
          13.095,
          79.935
        ],
        "passed": false
      },
      {
        "name": "Aranvoyalkuppam",
        "time": "7:10 AM",
        "location": [
          13.128,
          79.968
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:25 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.078,
      79.875
    ],
    "path": [],
    "currentStopIndex": 7,
    "nextStop": "Pannur",
    "etaMinutes": 29,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:5",
    "routeNumber": "RNo:5",
    "routeName": "KANCHIPURAM Via SRI PERUMBUDUR",
    "busNumber": "TN-20-BZ-4105",
    "driver": {
      "name": "M. Kumar",
      "phone": "+91 94445 55005",
      "license": "TN-21-2014-0105",
      "experienceYears": 15
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 50,
    "speedKmH": 45,
    "stops": [
      {
        "name": "Collector Office",
        "time": "5:30 AM",
        "location": [
          12.836,
          79.702
        ],
        "passed": true
      },
      {
        "name": "Kanchipurambusstand",
        "time": "5:40 AM",
        "location": [
          12.839,
          79.708
        ],
        "passed": true
      },
      {
        "name": "Meenakshi Hospital",
        "time": "5:50 AM",
        "location": [
          12.855,
          79.73
        ],
        "passed": true
      },
      {
        "name": "Sungavachitram",
        "time": "6:05 AM",
        "location": [
          12.89,
          79.81
        ],
        "passed": true
      },
      {
        "name": "Sri perambudur",
        "time": "6:20 AM",
        "location": [
          12.968,
          79.945
        ],
        "passed": true
      },
      {
        "name": "Kootroad",
        "time": "6:30 AM",
        "location": [
          12.985,
          79.955
        ],
        "passed": true
      },
      {
        "name": "Chenkadu",
        "time": "6:35 AM",
        "location": [
          13.01,
          79.96
        ],
        "passed": false
      },
      {
        "name": "Polivakkam",
        "time": "6:40 AM",
        "location": [
          13.055,
          79.965
        ],
        "passed": false
      },
      {
        "name": "Athikulam pattai",
        "time": "6:42 AM",
        "location": [
          13.075,
          79.968
        ],
        "passed": false
      },
      {
        "name": "Melnallatthur pattarai",
        "time": "6:50 AM",
        "location": [
          13.105,
          79.935
        ],
        "passed": false
      },
      {
        "name": "Manaval nagar",
        "time": "7:00 AM",
        "location": [
          13.125,
          79.925
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:25 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.01,
      79.96
    ],
    "path": [],
    "currentStopIndex": 6,
    "nextStop": "Chenkadu",
    "etaMinutes": 32,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:07",
    "routeNumber": "RNo:07",
    "routeName": "TAMARAPAKKAM -THIRUVALLUR",
    "busNumber": "TN-20-BZ-4107",
    "driver": {
      "name": "R. Jayaprakash",
      "phone": "+91 94446 55007",
      "license": "TN-20-2016-0107",
      "experienceYears": 10
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 46,
    "speedKmH": 41,
    "stops": [
      {
        "name": "Tamaraipakkam",
        "time": "6:20 AM",
        "location": [
          13.22,
          80.015
        ],
        "passed": true
      },
      {
        "name": "Velliyur",
        "time": "6:30 AM",
        "location": [
          13.205,
          79.995
        ],
        "passed": true
      },
      {
        "name": "Velapakkam",
        "time": "6:35 AM",
        "location": [
          13.19,
          79.98
        ],
        "passed": true
      },
      {
        "name": "Vishnuvakkam",
        "time": "6:40 AM",
        "location": [
          13.175,
          79.965
        ],
        "passed": false
      },
      {
        "name": "Ekadu Kandigai",
        "time": "6:45 AM",
        "location": [
          13.16,
          79.945
        ],
        "passed": false
      },
      {
        "name": "DRBCC Gowdi Nagar",
        "time": "6:50 AM",
        "location": [
          13.15,
          79.93
        ],
        "passed": false
      },
      {
        "name": "Theradi",
        "time": "6:55 AM",
        "location": [
          13.142,
          79.912
        ],
        "passed": false
      },
      {
        "name": "Ondikuppam",
        "time": "7:10 AM",
        "location": [
          13.13,
          79.935
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.175,
      79.965
    ],
    "path": [],
    "currentStopIndex": 3,
    "nextStop": "Vishnuvakkam",
    "etaMinutes": 32,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:8",
    "routeNumber": "RNo:8",
    "routeName": "GUMMIDIPOONDI Via REDHILLS",
    "busNumber": "TN-20-BZ-4108",
    "driver": {
      "name": "A. Balaji",
      "phone": "+91 94447 55008",
      "license": "TN-18-2013-0108",
      "experienceYears": 13
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 52,
    "speedKmH": 46,
    "stops": [
      {
        "name": "Gummidipoondi",
        "time": "5:30 AM",
        "location": [
          13.405,
          80.125
        ],
        "passed": true
      },
      {
        "name": "Kavaripettai",
        "time": "5:40 AM",
        "location": [
          13.365,
          80.135
        ],
        "passed": true
      },
      {
        "name": "Puduvayal",
        "time": "5:50 AM",
        "location": [
          13.325,
          80.145
        ],
        "passed": true
      },
      {
        "name": "Tachurkootroad",
        "time": "6:00 AM",
        "location": [
          13.29,
          80.155
        ],
        "passed": true
      },
      {
        "name": "Janapanchatram X Road",
        "time": "6:10 AM",
        "location": [
          13.265,
          80.16
        ],
        "passed": true
      },
      {
        "name": "Karanaodai",
        "time": "6:15 AM",
        "location": [
          13.245,
          80.165
        ],
        "passed": true
      },
      {
        "name": "Cholavaram",
        "time": "6:20 AM",
        "location": [
          13.225,
          80.168
        ],
        "passed": true
      },
      {
        "name": "Padiyanallur",
        "time": "6:25 AM",
        "location": [
          13.2,
          80.17
        ],
        "passed": false
      },
      {
        "name": "Redhils",
        "time": "6:30 AM",
        "location": [
          13.185,
          80.175
        ],
        "passed": false
      },
      {
        "name": "Aalamaram(GandhiNagar)",
        "time": "6:35 AM",
        "location": [
          13.195,
          80.13
        ],
        "passed": false
      },
      {
        "name": "Poochiathipedu",
        "time": "6:40 AM",
        "location": [
          13.205,
          80.08
        ],
        "passed": false
      },
      {
        "name": "Tamarpakkam",
        "time": "6:55 AM",
        "location": [
          13.22,
          80.015
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.2,
      80.17
    ],
    "path": [],
    "currentStopIndex": 7,
    "nextStop": "Padiyanallur",
    "etaMinutes": 32,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:09",
    "routeNumber": "RNo:09",
    "routeName": "THIRUVERKAADU Via AMBATTUR",
    "busNumber": "TN-20-BZ-4109",
    "driver": {
      "name": "G. Srinivasan",
      "phone": "+91 94448 55009",
      "license": "TN-02-2015-0109",
      "experienceYears": 12
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 47,
    "speedKmH": 43,
    "stops": [
      {
        "name": "Ramratna",
        "time": "5:50 AM",
        "location": [
          13.112,
          80.108
        ],
        "passed": true
      },
      {
        "name": "Avadimarket",
        "time": "5:55 AM",
        "location": [
          13.118,
          80.102
        ],
        "passed": true
      },
      {
        "name": "JP Estate",
        "time": "6:00 AM",
        "location": [
          13.115,
          80.115
        ],
        "passed": true
      },
      {
        "name": "Govardhan nagar",
        "time": "6:05 AM",
        "location": [
          13.11,
          80.122
        ],
        "passed": true
      },
      {
        "name": "Ayyangkulam",
        "time": "6:07 AM",
        "location": [
          13.085,
          80.128
        ],
        "passed": true
      },
      {
        "name": "Thiruverkaadu",
        "time": "6:20 AM",
        "location": [
          13.072,
          80.124
        ],
        "passed": true
      },
      {
        "name": "Koladi Road",
        "time": "6:25 AM",
        "location": [
          13.078,
          80.135
        ],
        "passed": true
      },
      {
        "name": "Ayyapakkam Pertrol Bunk",
        "time": "6:30 AM",
        "location": [
          13.09,
          80.145
        ],
        "passed": false
      },
      {
        "name": "Ayapakkam water Tank",
        "time": "6:35 AM",
        "location": [
          13.095,
          80.15
        ],
        "passed": false
      },
      {
        "name": "Dounlop",
        "time": "6:40 AM",
        "location": [
          13.11,
          80.158
        ],
        "passed": false
      },
      {
        "name": "Ambattur OT",
        "time": "6:45 AM",
        "location": [
          13.116,
          80.148
        ],
        "passed": false
      },
      {
        "name": "Thirumullaivoyal",
        "time": "6:50 AM",
        "location": [
          13.12,
          80.13
        ],
        "passed": false
      },
      {
        "name": "Murugappa Polytechnique",
        "time": "6:52 AM",
        "location": [
          13.118,
          80.115
        ],
        "passed": false
      },
      {
        "name": "Avadi",
        "time": "6:55 AM",
        "location": [
          13.115,
          80.1
        ],
        "passed": false
      },
      {
        "name": "Pattabram",
        "time": "7:00 AM",
        "location": [
          13.115,
          80.065
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:25 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.09,
      80.145
    ],
    "path": [],
    "currentStopIndex": 7,
    "nextStop": "Ayyapakkam Pertrol Bunk",
    "etaMinutes": 41,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:10",
    "routeNumber": "RNo:10",
    "routeName": "TIRUR -SEVVAPET",
    "busNumber": "TN-20-BZ-4110",
    "driver": {
      "name": "T. Elumalai",
      "phone": "+91 94449 55010",
      "license": "TN-20-2019-0110",
      "experienceYears": 8
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 41,
    "speedKmH": 39,
    "stops": [
      {
        "name": "Tirur",
        "time": "7:10 AM",
        "location": [
          13.125,
          79.955
        ],
        "passed": true
      },
      {
        "name": "PEC College Campus",
        "time": "7:25 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.1332,
      79.9725
    ],
    "path": [],
    "currentStopIndex": 1,
    "nextStop": "PEC College Campus",
    "etaMinutes": 17,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:11",
    "routeNumber": "RNo:11",
    "routeName": "TIRUTTANI",
    "busNumber": "TN-20-BZ-4111",
    "driver": {
      "name": "C. Damodaran",
      "phone": "+91 94450 55011",
      "license": "TN-20-2014-0111",
      "experienceYears": 13
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 51,
    "speedKmH": 45,
    "stops": [
      {
        "name": "Tiruttani",
        "time": "5:55 AM",
        "location": [
          13.178,
          79.61
        ],
        "passed": true
      },
      {
        "name": "Tiruttani bypass",
        "time": "6:00 AM",
        "location": [
          13.175,
          79.625
        ],
        "passed": true
      },
      {
        "name": "GRT",
        "time": "6:10 AM",
        "location": [
          13.172,
          79.635
        ],
        "passed": true
      },
      {
        "name": "Lakshmapuram",
        "time": "6:15 AM",
        "location": [
          13.168,
          79.66
        ],
        "passed": true
      },
      {
        "name": "Arcotkuppam",
        "time": "6:20 AM",
        "location": [
          13.165,
          79.69
        ],
        "passed": true
      },
      {
        "name": "Kanagamachirtram",
        "time": "6:25 AM",
        "location": [
          13.16,
          79.73
        ],
        "passed": false
      },
      {
        "name": "Ramancheri",
        "time": "6:30 AM",
        "location": [
          13.155,
          79.77
        ],
        "passed": false
      },
      {
        "name": "Narayanapuram",
        "time": "6:40 AM",
        "location": [
          13.15,
          79.82
        ],
        "passed": false
      },
      {
        "name": "Pandur",
        "time": "6:45 AM",
        "location": [
          13.148,
          79.85
        ],
        "passed": false
      },
      {
        "name": "Thirupachur",
        "time": "6:50 AM",
        "location": [
          13.145,
          79.87
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.16,
      79.73
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "Kanagamachirtram",
    "etaMinutes": 32,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:12",
    "routeNumber": "RNo:12",
    "routeName": "PALLIKARANI Via KILKATTALAI",
    "busNumber": "TN-20-BZ-4112",
    "driver": {
      "name": "M. Shanmugam",
      "phone": "+91 94441 23451",
      "license": "TN-04-2015-0029",
      "experienceYears": 14
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 49,
    "speedKmH": 40,
    "stops": [
      {
        "name": "Medavakkam",
        "time": "5:40 AM",
        "location": [
          12.918,
          80.192
        ],
        "passed": true
      },
      {
        "name": "Pallikaranai",
        "time": "5:45 AM",
        "location": [
          12.938,
          80.215
        ],
        "passed": true
      },
      {
        "name": "Velachary",
        "time": "5:55 AM",
        "location": [
          12.975,
          80.221
        ],
        "passed": true
      },
      {
        "name": "Vanvampet",
        "time": "6:05 AM",
        "location": [
          12.99,
          80.205
        ],
        "passed": true
      },
      {
        "name": "ThilliGanga Nagar",
        "time": "6:10 AM",
        "location": [
          12.998,
          80.195
        ],
        "passed": true
      },
      {
        "name": "Jothi Theater",
        "time": "6:15 AM",
        "location": [
          13.001,
          80.196
        ],
        "passed": true
      },
      {
        "name": "St.Thomasmount",
        "time": "6:18 AM",
        "location": [
          13.003,
          80.198
        ],
        "passed": true
      },
      {
        "name": "DLF Ramapuram",
        "time": "6:25 AM",
        "location": [
          13.029,
          80.175
        ],
        "passed": true
      },
      {
        "name": "Mugalivakkam",
        "time": "6:27 AM",
        "location": [
          13.033,
          80.165
        ],
        "passed": true
      },
      {
        "name": "Porur",
        "time": "6:35 AM",
        "location": [
          13.0382,
          80.1565
        ],
        "passed": true
      },
      {
        "name": "Iyyapanthangal",
        "time": "6:42 AM",
        "location": [
          13.045,
          80.125
        ],
        "passed": false
      },
      {
        "name": "Kattupakkam",
        "time": "6:45 AM",
        "location": [
          13.047,
          80.112
        ],
        "passed": false
      },
      {
        "name": "Kumunachavadi",
        "time": "6:50 AM",
        "location": [
          13.05,
          80.098
        ],
        "passed": false
      },
      {
        "name": "Nazarathpettai",
        "time": "7:05 AM",
        "location": [
          13.056,
          80.054
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.045,
      80.125
    ],
    "path": [],
    "currentStopIndex": 10,
    "nextStop": "Iyyapanthangal",
    "etaMinutes": 29,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:13",
    "routeNumber": "RNo:13",
    "routeName": "THANDALAM -THIRUMALISAI",
    "busNumber": "TN-20-BZ-4113",
    "driver": {
      "name": "N. Baskar",
      "phone": "+91 94451 55013",
      "license": "TN-20-2016-0113",
      "experienceYears": 10
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 44,
    "speedKmH": 42,
    "stops": [
      {
        "name": "Thandalam",
        "time": "6:50 AM",
        "location": [
          13.025,
          80.015
        ],
        "passed": true
      },
      {
        "name": "Chembarambakkam",
        "time": "7:00 AM",
        "location": [
          13.035,
          80.035
        ],
        "passed": true
      },
      {
        "name": "Thiumalisai-Juncation",
        "time": "7:10 AM",
        "location": [
          13.05,
          80.025
        ],
        "passed": true
      },
      {
        "name": "Thiumalisai",
        "time": "7:12 AM",
        "location": [
          13.055,
          80.02
        ],
        "passed": false
      },
      {
        "name": "Vellavedu",
        "time": "7:15 AM",
        "location": [
          13.07,
          79.995
        ],
        "passed": false
      },
      {
        "name": "Nemam",
        "time": "7:17 AM",
        "location": [
          13.085,
          79.98
        ],
        "passed": false
      },
      {
        "name": "Puduchatram",
        "time": "7:20 AM",
        "location": [
          13.1,
          79.975
        ],
        "passed": false
      },
      {
        "name": "Murkanchery",
        "time": "7:25 AM",
        "location": [
          13.115,
          79.97
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.055,
      80.02
    ],
    "path": [],
    "currentStopIndex": 3,
    "nextStop": "Thiumalisai",
    "etaMinutes": 32,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:14",
    "routeNumber": "RNo:14",
    "routeName": "KUNDRATHUR- BAIKADAI",
    "busNumber": "TN-20-BZ-4114",
    "driver": {
      "name": "K. Mohan",
      "phone": "+91 94452 55014",
      "license": "TN-11-2017-0114",
      "experienceYears": 11
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 48,
    "speedKmH": 41,
    "stops": [
      {
        "name": "Kundrathur",
        "time": "6:20 AM",
        "location": [
          12.997,
          80.097
        ],
        "passed": true
      },
      {
        "name": "Kovoor",
        "time": "6:25 AM",
        "location": [
          13.01,
          80.11
        ],
        "passed": true
      },
      {
        "name": "Baikadai",
        "time": "6:30 AM",
        "location": [
          13.025,
          80.12
        ],
        "passed": true
      },
      {
        "name": "Paraniputhur",
        "time": "6:35 AM",
        "location": [
          13.032,
          80.125
        ],
        "passed": false
      },
      {
        "name": "Mangadu",
        "time": "6:40 AM",
        "location": [
          13.042,
          80.115
        ],
        "passed": false
      },
      {
        "name": "Muthukumarn college",
        "time": "6:45 AM",
        "location": [
          13.045,
          80.105
        ],
        "passed": false
      },
      {
        "name": "Kumananchavadi",
        "time": "6:50 AM",
        "location": [
          13.047,
          80.095
        ],
        "passed": false
      },
      {
        "name": "Karayanchavadi",
        "time": "6:55 AM",
        "location": [
          13.05,
          80.085
        ],
        "passed": false
      },
      {
        "name": "Parivakkam",
        "time": "6:57 AM",
        "location": [
          13.052,
          80.075
        ],
        "passed": false
      },
      {
        "name": "Poonamalle",
        "time": "7:00 AM",
        "location": [
          13.048,
          80.095
        ],
        "passed": false
      },
      {
        "name": "Nazarathpet",
        "time": "7:02 AM",
        "location": [
          13.056,
          80.054
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.032,
      80.125
    ],
    "path": [],
    "currentStopIndex": 3,
    "nextStop": "Paraniputhur",
    "etaMinutes": 41,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:15",
    "routeNumber": "RNo:15",
    "routeName": "PALLIPATTU Via THIRUTTANI",
    "busNumber": "TN-20-BZ-4115",
    "driver": {
      "name": "V. Parthiban",
      "phone": "+91 94453 55015",
      "license": "TN-20-2013-0115",
      "experienceYears": 15
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 47,
    "speedKmH": 44,
    "stops": [
      {
        "name": "Pallipattu",
        "time": "5:15 AM",
        "location": [
          13.33,
          79.44
        ],
        "passed": true
      },
      {
        "name": "Athimanjeripet",
        "time": "5:25 AM",
        "location": [
          13.28,
          79.48
        ],
        "passed": true
      },
      {
        "name": "Podaturpet",
        "time": "5:40 AM",
        "location": [
          13.24,
          79.52
        ],
        "passed": true
      },
      {
        "name": "Malethiruttani",
        "time": "6:10 AM",
        "location": [
          13.19,
          79.59
        ],
        "passed": false
      },
      {
        "name": "Thiruttani Bye Pass",
        "time": "6:15 AM",
        "location": [
          13.175,
          79.625
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.19,
      79.59
    ],
    "path": [],
    "currentStopIndex": 3,
    "nextStop": "Malethiruttani",
    "etaMinutes": 23,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:16",
    "routeNumber": "RNo:16",
    "routeName": "SHOLINGER-ARAKKONAM",
    "busNumber": "TN-20-BZ-4116",
    "driver": {
      "name": "J. Subramani",
      "phone": "+91 94454 55016",
      "license": "TN-73-2015-0116",
      "experienceYears": 13
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 50,
    "speedKmH": 45,
    "stops": [
      {
        "name": "Sholonger(Karumariamman)",
        "time": "5:25 AM",
        "location": [
          13.11,
          79.425
        ],
        "passed": true
      },
      {
        "name": "Parangi",
        "time": "5:35 AM",
        "location": [
          13.1,
          79.49
        ],
        "passed": true
      },
      {
        "name": "Salai",
        "time": "5:50 AM",
        "location": [
          13.09,
          79.56
        ],
        "passed": true
      },
      {
        "name": "Kuminipettai",
        "time": "6:00 AM",
        "location": [
          13.085,
          79.61
        ],
        "passed": true
      },
      {
        "name": "Arakkonam",
        "time": "6:10 AM",
        "location": [
          13.08,
          79.67
        ],
        "passed": false
      },
      {
        "name": "Suvalpet",
        "time": "6:15 AM",
        "location": [
          13.075,
          79.69
        ],
        "passed": false
      },
      {
        "name": "Odinmani",
        "time": "6:20 AM",
        "location": [
          13.07,
          79.72
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.08,
      79.67
    ],
    "path": [],
    "currentStopIndex": 4,
    "nextStop": "Arakkonam",
    "etaMinutes": 26,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:17",
    "routeNumber": "RNo:17",
    "routeName": "MOOLAKADAI-AVADI",
    "busNumber": "TN-20-BZ-4117",
    "driver": {
      "name": "D. Jayakumar",
      "phone": "+91 94455 55017",
      "license": "TN-05-2014-0117",
      "experienceYears": 14
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 48,
    "speedKmH": 42,
    "stops": [
      {
        "name": "Kanakadasan nagar",
        "time": "5:55 AM",
        "location": [
          13.125,
          80.235
        ],
        "passed": true
      },
      {
        "name": "MR Nagar Market",
        "time": "6:05 AM",
        "location": [
          13.12,
          80.245
        ],
        "passed": true
      },
      {
        "name": "Moolakadai",
        "time": "6:10 AM",
        "location": [
          13.128,
          80.23
        ],
        "passed": true
      },
      {
        "name": "Senthilnagar",
        "time": "6:15 AM",
        "location": [
          13.122,
          80.21
        ],
        "passed": true
      },
      {
        "name": "Lucas",
        "time": "6:18 AM",
        "location": [
          13.115,
          80.19
        ],
        "passed": true
      },
      {
        "name": "Ambattur OT",
        "time": "6:35 AM",
        "location": [
          13.116,
          80.148
        ],
        "passed": false
      },
      {
        "name": "Singapore complex",
        "time": "6:37 AM",
        "location": [
          13.117,
          80.138
        ],
        "passed": false
      },
      {
        "name": "Murugappa polytechnic",
        "time": "6:45 AM",
        "location": [
          13.118,
          80.115
        ],
        "passed": false
      },
      {
        "name": "Avadichekpost",
        "time": "6:52 AM",
        "location": [
          13.115,
          80.105
        ],
        "passed": false
      },
      {
        "name": "Kavarapalayam",
        "time": "6:54 AM",
        "location": [
          13.116,
          80.09
        ],
        "passed": false
      },
      {
        "name": "Hinducollege",
        "time": "6:58 AM",
        "location": [
          13.117,
          80.075
        ],
        "passed": false
      },
      {
        "name": "Pattabiram",
        "time": "7:00 AM",
        "location": [
          13.115,
          80.065
        ],
        "passed": false
      },
      {
        "name": "Jayacollege",
        "time": "7:03 AM",
        "location": [
          13.114,
          80.045
        ],
        "passed": false
      },
      {
        "name": "DR Benefit",
        "time": "7:04 AM",
        "location": [
          13.115,
          80.035
        ],
        "passed": false
      },
      {
        "name": "Thiruninravur",
        "time": "7:05 AM",
        "location": [
          13.115,
          80.025
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.116,
      80.148
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "Ambattur OT",
    "etaMinutes": 47,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:20",
    "routeNumber": "RNo:20",
    "routeName": "MUTHUYALPET Via POONGANAGAR",
    "busNumber": "TN-20-BZ-4120",
    "driver": {
      "name": "E. Chandran",
      "phone": "+91 94456 55020",
      "license": "TN-20-2017-0120",
      "experienceYears": 10
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 46,
    "speedKmH": 40,
    "stops": [
      {
        "name": "Veltech College",
        "time": "5:50 AM",
        "location": [
          13.18,
          80.11
        ],
        "passed": true
      },
      {
        "name": "Ajeya stadium",
        "time": "5:55 AM",
        "location": [
          13.165,
          80.095
        ],
        "passed": true
      },
      {
        "name": "Mitnamallee",
        "time": "6:00 AM",
        "location": [
          13.155,
          80.088
        ],
        "passed": true
      },
      {
        "name": "Muthapudupet",
        "time": "6:02 AM",
        "location": [
          13.145,
          80.08
        ],
        "passed": true
      },
      {
        "name": "Thirunindravur IndianBank",
        "time": "6:20 AM",
        "location": [
          13.118,
          80.025
        ],
        "passed": true
      },
      {
        "name": "Steel Roll",
        "time": "6:25 AM",
        "location": [
          13.12,
          80.01
        ],
        "passed": false
      },
      {
        "name": "Puliyamaram",
        "time": "6:30 AM",
        "location": [
          13.121,
          79.995
        ],
        "passed": false
      },
      {
        "name": "Perumalpet",
        "time": "6:35 AM",
        "location": [
          13.122,
          79.985
        ],
        "passed": false
      },
      {
        "name": "Shevapet police Station",
        "time": "6:40 AM",
        "location": [
          13.12,
          79.98
        ],
        "passed": false
      },
      {
        "name": "Thaneerkulam",
        "time": "6:45 AM",
        "location": [
          13.13,
          79.94
        ],
        "passed": false
      },
      {
        "name": "Collector Office",
        "time": "6:50 AM",
        "location": [
          13.138,
          79.91
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.12,
      80.01
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "Steel Roll",
    "etaMinutes": 35,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:22",
    "routeNumber": "RNo:22",
    "routeName": "PERAMBUR Via RETTERI, GOLDEN FLATS",
    "busNumber": "TN-20-BZ-4122",
    "driver": {
      "name": "S. Govindaraj",
      "phone": "+91 94457 55022",
      "license": "TN-03-2016-0122",
      "experienceYears": 12
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 51,
    "speedKmH": 43,
    "stops": [
      {
        "name": "Perambur BP Road",
        "time": "5:45 AM",
        "location": [
          13.108,
          80.245
        ],
        "passed": true
      },
      {
        "name": "Perambur Market",
        "time": "5:50 AM",
        "location": [
          13.11,
          80.24
        ],
        "passed": true
      },
      {
        "name": "Perambur Chruch",
        "time": "5:52 AM",
        "location": [
          13.112,
          80.235
        ],
        "passed": true
      },
      {
        "name": "Peravalur Road -Agaram",
        "time": "5:57 AM",
        "location": [
          13.115,
          80.228
        ],
        "passed": true
      },
      {
        "name": "Periyar Nagar",
        "time": "6:02 AM",
        "location": [
          13.118,
          80.218
        ],
        "passed": true
      },
      {
        "name": "Weldingshop",
        "time": "6:07 AM",
        "location": [
          13.122,
          80.208
        ],
        "passed": true
      },
      {
        "name": "Retteri",
        "time": "6:12 AM",
        "location": [
          13.13,
          80.2
        ],
        "passed": true
      },
      {
        "name": "Senthilnagar",
        "time": "6:15 AM",
        "location": [
          13.115,
          80.198
        ],
        "passed": true
      },
      {
        "name": "Annanagar Dep",
        "time": "6:20 AM",
        "location": [
          13.085,
          80.205
        ],
        "passed": false
      },
      {
        "name": "Collector Nagar",
        "time": "6:25 AM",
        "location": [
          13.083,
          80.195
        ],
        "passed": false
      },
      {
        "name": "DAV school",
        "time": "6:30 AM",
        "location": [
          13.082,
          80.185
        ],
        "passed": false
      },
      {
        "name": "Golden Flats",
        "time": "6:32 AM",
        "location": [
          13.081,
          80.178
        ],
        "passed": false
      },
      {
        "name": "7H Bus Stand",
        "time": "6:35 AM",
        "location": [
          13.08,
          80.173
        ],
        "passed": false
      },
      {
        "name": "Mugapair West",
        "time": "6:38 AM",
        "location": [
          13.08,
          80.168
        ],
        "passed": false
      },
      {
        "name": "Vanagaram Bridge",
        "time": "6:45 AM",
        "location": [
          13.065,
          80.145
        ],
        "passed": false
      },
      {
        "name": "ACS",
        "time": "6:50 AM",
        "location": [
          13.058,
          80.128
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.085,
      80.205
    ],
    "path": [],
    "currentStopIndex": 8,
    "nextStop": "Annanagar Dep",
    "etaMinutes": 41,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:23",
    "routeNumber": "RNo:23",
    "routeName": "RK PET-KG KANDIGAI Via THIRUTTANI",
    "busNumber": "TN-20-BZ-4123",
    "driver": {
      "name": "R. Mani",
      "phone": "+91 94458 55023",
      "license": "TN-20-2015-0123",
      "experienceYears": 13
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 49,
    "speedKmH": 44,
    "stops": [
      {
        "name": "Rkpet",
        "time": "5:30 AM",
        "location": [
          13.21,
          79.45
        ],
        "passed": true
      },
      {
        "name": "K.G Kandigai",
        "time": "5:40 AM",
        "location": [
          13.2,
          79.5
        ],
        "passed": true
      },
      {
        "name": "Thadur",
        "time": "5:42 AM",
        "location": [
          13.19,
          79.53
        ],
        "passed": true
      },
      {
        "name": "Koramangalam",
        "time": "5:55 AM",
        "location": [
          13.185,
          79.56
        ],
        "passed": true
      },
      {
        "name": "Agoor",
        "time": "6:00 AM",
        "location": [
          13.18,
          79.585
        ],
        "passed": false
      },
      {
        "name": "Thiruttani Bye Pass",
        "time": "6:15 AM",
        "location": [
          13.175,
          79.625
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.18,
      79.585
    ],
    "path": [],
    "currentStopIndex": 4,
    "nextStop": "Agoor",
    "etaMinutes": 23,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:25",
    "routeNumber": "RNo:25",
    "routeName": "PERAMBAKKAM",
    "busNumber": "TN-20-BZ-4125",
    "driver": {
      "name": "B. Srinivasan",
      "phone": "+91 94459 55025",
      "license": "TN-20-2018-0125",
      "experienceYears": 9
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 43,
    "speedKmH": 40,
    "stops": [
      {
        "name": "Chathiramkandigai",
        "time": "6:20 AM",
        "location": [
          13.06,
          79.79
        ],
        "passed": true
      },
      {
        "name": "Pudumavilanga",
        "time": "6:30 AM",
        "location": [
          13.08,
          79.83
        ],
        "passed": true
      },
      {
        "name": "Kadambathur",
        "time": "6:35 AM",
        "location": [
          13.1,
          79.87
        ],
        "passed": true
      },
      {
        "name": "Thirupachur",
        "time": "6:40 AM",
        "location": [
          13.145,
          79.87
        ],
        "passed": false
      },
      {
        "name": "Tollgate",
        "time": "6:45 AM",
        "location": [
          13.142,
          79.89
        ],
        "passed": false
      },
      {
        "name": "Thiruvallur",
        "time": "6:55 AM",
        "location": [
          13.143,
          79.907
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.145,
      79.87
    ],
    "path": [],
    "currentStopIndex": 3,
    "nextStop": "Thirupachur",
    "etaMinutes": 26,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:26",
    "routeNumber": "RNo:26",
    "routeName": "AYYNAVARAM VIA VILLIVAKKAM",
    "busNumber": "TN-20-BZ-4126",
    "driver": {
      "name": "M. Ganesan",
      "phone": "+91 94460 55026",
      "license": "TN-01-2014-0126",
      "experienceYears": 14
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 50,
    "speedKmH": 42,
    "stops": [
      {
        "name": "Ayynavaram TB Hospital",
        "time": "6:00 AM",
        "location": [
          13.098,
          80.235
        ],
        "passed": true
      },
      {
        "name": "Ayynavaram busstand",
        "time": "6:05 AM",
        "location": [
          13.095,
          80.23
        ],
        "passed": true
      },
      {
        "name": "Noor Hotel",
        "time": "6:10 AM",
        "location": [
          13.093,
          80.225
        ],
        "passed": true
      },
      {
        "name": "Jointoffice",
        "time": "6:02 AM",
        "location": [
          13.097,
          80.22
        ],
        "passed": true
      },
      {
        "name": "ICF Bus Stop",
        "time": "6:05 AM",
        "location": [
          13.1,
          80.215
        ],
        "passed": true
      },
      {
        "name": "Villivakkam busstand",
        "time": "6:10 AM",
        "location": [
          13.105,
          80.205
        ],
        "passed": true
      },
      {
        "name": "Nathamuni",
        "time": "6:15 AM",
        "location": [
          13.11,
          80.198
        ],
        "passed": true
      },
      {
        "name": "Lucas",
        "time": "6:18 AM",
        "location": [
          13.115,
          80.19
        ],
        "passed": false
      },
      {
        "name": "Ambattur Estate",
        "time": "6:30 AM",
        "location": [
          13.098,
          80.165
        ],
        "passed": false
      },
      {
        "name": "Ambattur OT",
        "time": "6:40 AM",
        "location": [
          13.116,
          80.148
        ],
        "passed": false
      },
      {
        "name": "Thirumullaivoyal",
        "time": "6:45 AM",
        "location": [
          13.12,
          80.13
        ],
        "passed": false
      },
      {
        "name": "Avadichekpost",
        "time": "6:48 AM",
        "location": [
          13.115,
          80.105
        ],
        "passed": false
      },
      {
        "name": "Cheakadu",
        "time": "6:50 AM",
        "location": [
          13.116,
          80.09
        ],
        "passed": false
      },
      {
        "name": "Hinducollege",
        "time": "6:53 AM",
        "location": [
          13.117,
          80.075
        ],
        "passed": false
      },
      {
        "name": "Pattabiram",
        "time": "7:00 AM",
        "location": [
          13.115,
          80.065
        ],
        "passed": false
      },
      {
        "name": "Jayacollege",
        "time": "7:04 AM",
        "location": [
          13.114,
          80.045
        ],
        "passed": false
      },
      {
        "name": "Thirunindruvr",
        "time": "7:06 AM",
        "location": [
          13.115,
          80.025
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.115,
      80.19
    ],
    "path": [],
    "currentStopIndex": 7,
    "nextStop": "Lucas",
    "etaMinutes": 47,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:27",
    "routeNumber": "RNo:27",
    "routeName": "MINJUR VIA PONNERI",
    "busNumber": "TN-20-BZ-4127",
    "driver": {
      "name": "K. Venkatesulu",
      "phone": "+91 94461 55027",
      "license": "TN-18-2015-0127",
      "experienceYears": 11
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 47,
    "speedKmH": 44,
    "stops": [
      {
        "name": "Minjur",
        "time": "5:30 AM",
        "location": [
          13.275,
          80.26
        ],
        "passed": true
      },
      {
        "name": "Ponneri",
        "time": "5:45 AM",
        "location": [
          13.32,
          80.19
        ],
        "passed": true
      },
      {
        "name": "Thachur-Koot Road",
        "time": "6:00 AM",
        "location": [
          13.29,
          80.155
        ],
        "passed": true
      },
      {
        "name": "Arani",
        "time": "6:10 AM",
        "location": [
          13.25,
          80.09
        ],
        "passed": true
      },
      {
        "name": "Periyapalayam",
        "time": "6:25 AM",
        "location": [
          13.31,
          80.02
        ],
        "passed": true
      },
      {
        "name": "Vengal",
        "time": "6:35 AM",
        "location": [
          13.24,
          80.01
        ],
        "passed": false
      },
      {
        "name": "Tamarpakkam",
        "time": "6:45 AM",
        "location": [
          13.22,
          80.015
        ],
        "passed": false
      },
      {
        "name": "Pakkam",
        "time": "7:00 AM",
        "location": [
          13.18,
          79.99
        ],
        "passed": false
      },
      {
        "name": "Thiruninravur",
        "time": "7:05 AM",
        "location": [
          13.115,
          80.025
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.24,
      80.01
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "Vengal",
    "etaMinutes": 29,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:28",
    "routeNumber": "RNo:28",
    "routeName": "MMDA Via TRIPLICANE,PORUR",
    "busNumber": "TN-20-BZ-4128",
    "driver": {
      "name": "A. Saravanan",
      "phone": "+91 98401 23450",
      "license": "TN-01-2012-0045",
      "experienceYears": 16
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 53,
    "speedKmH": 41,
    "stops": [
      {
        "name": "Pudupet",
        "time": "5:30 AM",
        "location": [
          13.07,
          80.27
        ],
        "passed": true
      },
      {
        "name": "Triplicane",
        "time": "5:32 AM",
        "location": [
          13.055,
          80.275
        ],
        "passed": true
      },
      {
        "name": "Pattinapakkam",
        "time": "5:37 AM",
        "location": [
          13.03,
          80.278
        ],
        "passed": true
      },
      {
        "name": "Dr radhakrishnansalai",
        "time": "5:40 AM",
        "location": [
          13.042,
          80.265
        ],
        "passed": true
      },
      {
        "name": "T.Nagar",
        "time": "6:00 AM",
        "location": [
          13.04,
          80.233
        ],
        "passed": true
      },
      {
        "name": "CIT Nagar",
        "time": "6:05 AM",
        "location": [
          13.032,
          80.23
        ],
        "passed": true
      },
      {
        "name": "Srinivasa Theater",
        "time": "6:10 AM",
        "location": [
          13.034,
          80.22
        ],
        "passed": true
      },
      {
        "name": "Ashokpillier",
        "time": "6:03 AM",
        "location": [
          13.033,
          80.211
        ],
        "passed": true
      },
      {
        "name": "Lakshman sruthi",
        "time": "6:08 AM",
        "location": [
          13.035,
          80.205
        ],
        "passed": true
      },
      {
        "name": "MGR Nagar",
        "time": "6:10 AM",
        "location": [
          13.036,
          80.198
        ],
        "passed": true
      },
      {
        "name": "Virugambakkam",
        "time": "6:16 AM",
        "location": [
          13.048,
          80.19
        ],
        "passed": true
      },
      {
        "name": "Alwarthirunagar",
        "time": "6:20 AM",
        "location": [
          13.045,
          80.178
        ],
        "passed": false
      },
      {
        "name": "Valasaravakkam",
        "time": "6:25 AM",
        "location": [
          13.042,
          80.168
        ],
        "passed": false
      },
      {
        "name": "Porur (Karambakkam)",
        "time": "6:35 AM",
        "location": [
          13.038,
          80.156
        ],
        "passed": false
      },
      {
        "name": "Poonamalle",
        "time": "6:45 AM",
        "location": [
          13.048,
          80.095
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.045,
      80.178
    ],
    "path": [],
    "currentStopIndex": 11,
    "nextStop": "Alwarthirunagar",
    "etaMinutes": 29,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:29",
    "routeNumber": "RNo:29",
    "routeName": "MATHUR Via MOOLAKADAI",
    "busNumber": "TN-20-BZ-4129",
    "driver": {
      "name": "P. Karthikeyan",
      "phone": "+91 94462 55029",
      "license": "TN-05-2017-0129",
      "experienceYears": 10
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 49,
    "speedKmH": 43,
    "stops": [
      {
        "name": "Thazhankuppam",
        "time": "5:20 AM",
        "location": [
          13.225,
          80.32
        ],
        "passed": true
      },
      {
        "name": "Kathivakkam Railwa Station",
        "time": "5:30 AM",
        "location": [
          13.21,
          80.315
        ],
        "passed": true
      },
      {
        "name": "Sathya Moorthy nagar",
        "time": "5:45 AM",
        "location": [
          13.19,
          80.28
        ],
        "passed": true
      },
      {
        "name": "Manali Pudhunagar",
        "time": "5:55 AM",
        "location": [
          13.18,
          80.27
        ],
        "passed": true
      },
      {
        "name": "Manalimarket",
        "time": "6:00 AM",
        "location": [
          13.17,
          80.26
        ],
        "passed": true
      },
      {
        "name": "Post Office",
        "time": "6:10 AM",
        "location": [
          13.155,
          80.245
        ],
        "passed": true
      },
      {
        "name": "Madhavram Bus Stand",
        "time": "6:15 AM",
        "location": [
          13.145,
          80.225
        ],
        "passed": false
      },
      {
        "name": "Puzhal",
        "time": "6:20 AM",
        "location": [
          13.155,
          80.195
        ],
        "passed": false
      },
      {
        "name": "Suraped",
        "time": "6:30 AM",
        "location": [
          13.14,
          80.165
        ],
        "passed": false
      },
      {
        "name": "Kallikuppam",
        "time": "6:35 AM",
        "location": [
          13.13,
          80.155
        ],
        "passed": false
      },
      {
        "name": "Pudhur",
        "time": "6:40 AM",
        "location": [
          13.122,
          80.15
        ],
        "passed": false
      },
      {
        "name": "Orakadam",
        "time": "6:43 AM",
        "location": [
          13.118,
          80.148
        ],
        "passed": false
      },
      {
        "name": "Ambattur",
        "time": "6:47 AM",
        "location": [
          13.115,
          80.145
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.145,
      80.225
    ],
    "path": [],
    "currentStopIndex": 6,
    "nextStop": "Madhavram Bus Stand",
    "etaMinutes": 38,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:30",
    "routeNumber": "RNo:30",
    "routeName": "KATCHUR",
    "busNumber": "TN-20-BZ-4130",
    "driver": {
      "name": "N. Srinivasan",
      "phone": "+91 94463 55030",
      "license": "TN-20-2016-0130",
      "experienceYears": 12
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 46,
    "speedKmH": 40,
    "stops": [
      {
        "name": "Pirancheri",
        "time": "6:15 AM",
        "location": [
          13.25,
          79.93
        ],
        "passed": true
      },
      {
        "name": "Katchur",
        "time": "6:25 AM",
        "location": [
          13.235,
          79.925
        ],
        "passed": true
      },
      {
        "name": "Thiruvallur",
        "time": "6:55 AM",
        "location": [
          13.143,
          79.907
        ],
        "passed": true
      },
      {
        "name": "Manavalanagar",
        "time": "7:05 AM",
        "location": [
          13.125,
          79.925
        ],
        "passed": false
      },
      {
        "name": "Ondikuppam",
        "time": "7:10 AM",
        "location": [
          13.13,
          79.935
        ],
        "passed": false
      },
      {
        "name": "Vengathur",
        "time": "7:15 AM",
        "location": [
          13.135,
          79.945
        ],
        "passed": false
      },
      {
        "name": "Potulur",
        "time": "7:17 AM",
        "location": [
          13.136,
          79.955
        ],
        "passed": false
      },
      {
        "name": "Aranvoyal",
        "time": "7:22 AM",
        "location": [
          13.132,
          79.965
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.125,
      79.925
    ],
    "path": [],
    "currentStopIndex": 3,
    "nextStop": "Manavalanagar",
    "etaMinutes": 32,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:30B",
    "routeNumber": "RNo:30B",
    "routeName": "THIRUVALLUR LOCAL",
    "busNumber": "TN-20-BZ-4131",
    "driver": {
      "name": "L. Natarajan",
      "phone": "+91 94464 55031",
      "license": "TN-20-2018-0131",
      "experienceYears": 9
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 40,
    "speedKmH": 38,
    "stops": [
      {
        "name": "Thiruvallur",
        "time": "7:00 AM",
        "location": [
          13.143,
          79.907
        ],
        "passed": true
      },
      {
        "name": "Statebank",
        "time": "7:05 AM",
        "location": [
          13.14,
          79.908
        ],
        "passed": true
      },
      {
        "name": "Oilmill",
        "time": "7:10 AM",
        "location": [
          13.135,
          79.915
        ],
        "passed": false
      },
      {
        "name": "Manavalanagar",
        "time": "7:15 AM",
        "location": [
          13.125,
          79.925
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:20 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.135,
      79.915
    ],
    "path": [],
    "currentStopIndex": 2,
    "nextStop": "Oilmill",
    "etaMinutes": 23,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:31",
    "routeNumber": "RNo:31",
    "routeName": "THIRUVOTRIYUR Via NSK NAGAR",
    "busNumber": "TN-20-BZ-4132",
    "driver": {
      "name": "T. Jayaraman",
      "phone": "+91 98403 45673",
      "license": "TN-02-2013-0092",
      "experienceYears": 15
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 52,
    "speedKmH": 43,
    "stops": [
      {
        "name": "Nethaji nagar",
        "time": "5:20 AM",
        "location": [
          13.17,
          80.305
        ],
        "passed": true
      },
      {
        "name": "Theradi",
        "time": "5:35 AM",
        "location": [
          13.155,
          80.3
        ],
        "passed": true
      },
      {
        "name": "Toll Gate",
        "time": "5:42 AM",
        "location": [
          13.135,
          80.295
        ],
        "passed": true
      },
      {
        "name": "Manikoondu",
        "time": "5:55 AM",
        "location": [
          13.12,
          80.29
        ],
        "passed": true
      },
      {
        "name": "Maharani",
        "time": "5:58 AM",
        "location": [
          13.112,
          80.285
        ],
        "passed": true
      },
      {
        "name": "Mint",
        "time": "6:05 AM",
        "location": [
          13.105,
          80.28
        ],
        "passed": true
      },
      {
        "name": "Choolai",
        "time": "6:15 AM",
        "location": [
          13.09,
          80.27
        ],
        "passed": true
      },
      {
        "name": "Purasai vakkam(Tank)",
        "time": "6:20 AM",
        "location": [
          13.085,
          80.255
        ],
        "passed": false
      },
      {
        "name": "Aminjikari",
        "time": "6:30 AM",
        "location": [
          13.075,
          80.22
        ],
        "passed": false
      },
      {
        "name": "NSK Nagar",
        "time": "6:33 AM",
        "location": [
          13.072,
          80.21
        ],
        "passed": false
      },
      {
        "name": "Arumbakkam",
        "time": "6:35 AM",
        "location": [
          13.07,
          80.205
        ],
        "passed": false
      },
      {
        "name": "KoyambaduMetro",
        "time": "6:40 AM",
        "location": [
          13.07,
          80.195
        ],
        "passed": false
      },
      {
        "name": "Madravoyal-Ration Shop",
        "time": "6:45 AM",
        "location": [
          13.065,
          80.165
        ],
        "passed": false
      },
      {
        "name": "Madravoyal Erikari",
        "time": "6:48 AM",
        "location": [
          13.062,
          80.155
        ],
        "passed": false
      },
      {
        "name": "Velappanchavadi",
        "time": "6:55 AM",
        "location": [
          13.058,
          80.125
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.085,
      80.255
    ],
    "path": [],
    "currentStopIndex": 7,
    "nextStop": "Purasai vakkam(Tank)",
    "etaMinutes": 41,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:34",
    "routeNumber": "RNo:34",
    "routeName": "MELNALLATHUR",
    "busNumber": "TN-20-BZ-4134",
    "driver": {
      "name": "V. Shankar",
      "phone": "+91 94465 55034",
      "license": "TN-20-2017-0134",
      "experienceYears": 10
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 43,
    "speedKmH": 39,
    "stops": [
      {
        "name": "Melnallathur",
        "time": "6:50 AM",
        "location": [
          13.11,
          79.93
        ],
        "passed": true
      },
      {
        "name": "Pattarai",
        "time": "6:55 AM",
        "location": [
          13.118,
          79.93
        ],
        "passed": false
      },
      {
        "name": "Manavalanagar",
        "time": "7:05 AM",
        "location": [
          13.125,
          79.925
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:25 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.118,
      79.93
    ],
    "path": [],
    "currentStopIndex": 1,
    "nextStop": "Pattarai",
    "etaMinutes": 23,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:35",
    "routeNumber": "RNo:35",
    "routeName": "POLUR Via TIRUTTANI",
    "busNumber": "TN-20-BZ-4135",
    "driver": {
      "name": "D. Ravi",
      "phone": "+91 94466 55035",
      "license": "TN-20-2014-0135",
      "experienceYears": 13
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 48,
    "speedKmH": 42,
    "stops": [
      {
        "name": "Thanigai Polur",
        "time": "5:55 AM",
        "location": [
          13.22,
          79.6
        ],
        "passed": true
      },
      {
        "name": "Tiruttani depot",
        "time": "6:00 AM",
        "location": [
          13.185,
          79.615
        ],
        "passed": true
      },
      {
        "name": "Tiruttani Busstand",
        "time": "6:05 AM",
        "location": [
          13.178,
          79.61
        ],
        "passed": true
      },
      {
        "name": "Kamala Theatre",
        "time": "6:10 AM",
        "location": [
          13.175,
          79.618
        ],
        "passed": true
      },
      {
        "name": "Roundtona",
        "time": "6:15 AM",
        "location": [
          13.173,
          79.622
        ],
        "passed": false
      },
      {
        "name": "Tiruttani bypass",
        "time": "6:20 AM",
        "location": [
          13.175,
          79.625
        ],
        "passed": false
      },
      {
        "name": "Kanakammachatram",
        "time": "6:35 AM",
        "location": [
          13.16,
          79.73
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.173,
      79.622
    ],
    "path": [],
    "currentStopIndex": 4,
    "nextStop": "Roundtona",
    "etaMinutes": 26,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:36",
    "routeNumber": "RNo:36",
    "routeName": "TAMBARAM Via KUNDRATHUR",
    "busNumber": "TN-20-BZ-4136",
    "driver": {
      "name": "R. Venkatesh",
      "phone": "+91 98402 34562",
      "license": "TN-11-2018-0418",
      "experienceYears": 11
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 46,
    "speedKmH": 42,
    "stops": [
      {
        "name": "Camprod",
        "time": "5:55 AM",
        "location": [
          12.915,
          80.14
        ],
        "passed": true
      },
      {
        "name": "Tambaram",
        "time": "6:00 AM",
        "location": [
          12.9249,
          80.12
        ],
        "passed": true
      },
      {
        "name": "Chromepet",
        "time": "6:05 AM",
        "location": [
          12.9516,
          80.1462
        ],
        "passed": true
      },
      {
        "name": "Pallavaram",
        "time": "6:10 AM",
        "location": [
          12.9675,
          80.1491
        ],
        "passed": true
      },
      {
        "name": "Pammal",
        "time": "6:20 AM",
        "location": [
          12.973,
          80.134
        ],
        "passed": true
      },
      {
        "name": "Kundrathur",
        "time": "6:35 AM",
        "location": [
          12.997,
          80.097
        ],
        "passed": false
      },
      {
        "name": "Baikadai",
        "time": "6:43 AM",
        "location": [
          13.025,
          80.12
        ],
        "passed": false
      },
      {
        "name": "Paraniputhur",
        "time": "6:50 AM",
        "location": [
          13.032,
          80.125
        ],
        "passed": false
      },
      {
        "name": "Mangadu",
        "time": "6:55 AM",
        "location": [
          13.042,
          80.115
        ],
        "passed": false
      },
      {
        "name": "Muthukumarn college",
        "time": "7:00 AM",
        "location": [
          13.045,
          80.105
        ],
        "passed": false
      },
      {
        "name": "Kumananchavadi",
        "time": "7:15 AM",
        "location": [
          13.047,
          80.095
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:25 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      12.997,
      80.097
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "Kundrathur",
    "etaMinutes": 35,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:37",
    "routeNumber": "RNo:37",
    "routeName": "THIRUTTANI DEPO Via GRT",
    "busNumber": "TN-20-BZ-4137",
    "driver": {
      "name": "G. Vijayan",
      "phone": "+91 94467 55037",
      "license": "TN-20-2016-0137",
      "experienceYears": 12
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 45,
    "speedKmH": 41,
    "stops": [
      {
        "name": "Anvarthikanpet",
        "time": "5:30 AM",
        "location": [
          13.05,
          79.55
        ],
        "passed": true
      },
      {
        "name": "Salai",
        "time": "5:45 AM",
        "location": [
          13.09,
          79.56
        ],
        "passed": true
      },
      {
        "name": "Kumpinipet Road",
        "time": "6:00 AM",
        "location": [
          13.11,
          79.58
        ],
        "passed": true
      },
      {
        "name": "Indira Gandhi statue",
        "time": "6:05 AM",
        "location": [
          13.17,
          79.61
        ],
        "passed": true
      },
      {
        "name": "GDN",
        "time": "6:10 AM",
        "location": [
          13.172,
          79.62
        ],
        "passed": false
      },
      {
        "name": "Stuartpet",
        "time": "6:15 AM",
        "location": [
          13.176,
          79.615
        ],
        "passed": false
      },
      {
        "name": "Thiruvalangadu",
        "time": "6:30 AM",
        "location": [
          13.135,
          79.78
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.172,
      79.62
    ],
    "path": [],
    "currentStopIndex": 4,
    "nextStop": "GDN",
    "etaMinutes": 26,
    "lastUpdated": "Live GPS active"
  },
  {
    "id": "RNo:39",
    "routeNumber": "RNo:39",
    "routeName": "THAKKOLAM Via PERUMUCHI VENKATESHPURAM",
    "busNumber": "TN-20-BZ-4139",
    "driver": {
      "name": "K. Balamurugan",
      "phone": "+91 94468 55039",
      "license": "TN-20-2015-0139",
      "experienceYears": 14
    },
    "status": "active",
    "capacity": 55,
    "occupancy": 50,
    "speedKmH": 44,
    "stops": [
      {
        "name": "Thakkolam",
        "time": "5:30 AM",
        "location": [
          13.02,
          79.68
        ],
        "passed": true
      },
      {
        "name": "Thakkolam Kuttroad",
        "time": "5:40 AM",
        "location": [
          13.03,
          79.675
        ],
        "passed": true
      },
      {
        "name": "Sathamangalam",
        "time": "5:45 AM",
        "location": [
          13.04,
          79.65
        ],
        "passed": true
      },
      {
        "name": "Perumuchi",
        "time": "5:50 AM",
        "location": [
          13.05,
          79.66
        ],
        "passed": true
      },
      {
        "name": "Venkatesh Puram(Naval Gate)",
        "time": "5:55 AM",
        "location": [
          13.06,
          79.67
        ],
        "passed": true
      },
      {
        "name": "SR Gate",
        "time": "6:00 AM",
        "location": [
          13.07,
          79.675
        ],
        "passed": false
      },
      {
        "name": "New Bus Stop",
        "time": "6:10 AM",
        "location": [
          13.078,
          79.68
        ],
        "passed": false
      },
      {
        "name": "Old bustand",
        "time": "6:15 AM",
        "location": [
          13.08,
          79.67
        ],
        "passed": false
      },
      {
        "name": "ODN Mani",
        "time": "6:20 AM",
        "location": [
          13.07,
          79.72
        ],
        "passed": false
      },
      {
        "name": "Kaliyar Kandigai",
        "time": "6:25 AM",
        "location": [
          13.09,
          79.74
        ],
        "passed": false
      },
      {
        "name": "ShawNagar",
        "time": "6:30 AM",
        "location": [
          13.11,
          79.76
        ],
        "passed": false
      },
      {
        "name": "Veera Puram",
        "time": "6:35 AM",
        "location": [
          13.12,
          79.77
        ],
        "passed": false
      },
      {
        "name": "Thiruvelangaadu",
        "time": "6:37 AM",
        "location": [
          13.135,
          79.78
        ],
        "passed": false
      },
      {
        "name": "PEC College Campus",
        "time": "7:30 AM",
        "location": [
          13.1332,
          79.9725
        ],
        "passed": false
      }
    ],
    "currentLocation": [
      13.07,
      79.675
    ],
    "path": [],
    "currentStopIndex": 5,
    "nextStop": "SR Gate",
    "etaMinutes": 41,
    "lastUpdated": "Live GPS active"
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Morning Fleet Departure On Schedule',
    message: 'All 32 official college bus routes commenced boarding on time according to the official 2026 transport schedule.',
    type: 'info',
    timestamp: 'Today, 05:30 AM',
    postedBy: 'PEC Fleet Control Desk'
  },
  {
    id: 'ann-2',
    title: 'Campus Arrival Protocol',
    message: 'All buses scheduled to report at PEC Campus between 07:20 AM and 07:30 AM.',
    type: 'info',
    timestamp: 'Today, 06:15 AM',
    postedBy: 'Transport Desk'
  }
];

const STORAGE_KEYS = {
  ROUTES: 'pec_smartbus_routes_official_v6',
  SOS_ALERTS: 'pec_smartbus_sos_alerts_v2',
  ANNOUNCEMENTS: 'pec_smartbus_announcements_v2'
};

function initializeDefaultRoute(r: BusRoute): BusRoute {
  return {
    ...r,
    status: 'scheduled',
    speedKmH: 0,
    heading: 0,
    currentLocation: r.stops[0]?.location || PEC_CAMPUS,
    stops: r.stops.map((s) => ({ ...s, passed: false })),
    lastUpdated: 'Scheduled departure',
    path: REAL_ROAD_PATHS[r.id] && REAL_ROAD_PATHS[r.id].length > 0 ? REAL_ROAD_PATHS[r.id] : buildRoutePath(r.stops, r.id)
  };
}

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
      return INITIAL_ROUTES.map(initializeDefaultRoute);
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTES);
    if (!raw) {
      const init = INITIAL_ROUTES.map(initializeDefaultRoute);
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(init));
      return init;
    }
    try {
      const parsed: BusRoute[] = JSON.parse(raw);
      // Auto-update if cached routes has fewer routes than official PDF routes (32 routes)
      if (!Array.isArray(parsed) || parsed.length < INITIAL_ROUTES.length) {
        const init = INITIAL_ROUTES.map(initializeDefaultRoute);
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(init));
        return init;
      }
      return parsed.map((r) => ({
        ...r,
        path:
          REAL_ROAD_PATHS[r.id] && REAL_ROAD_PATHS[r.id].length > 0
            ? REAL_ROAD_PATHS[r.id]
            : r.path && r.path.length > 0
            ? r.path
            : buildRoutePath(r.stops, r.id)
      }));
    } catch {
      return INITIAL_ROUTES.map(initializeDefaultRoute);
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

  public addRoute(newRoute: Omit<BusRoute, 'path' | 'currentLocation' | 'currentStopIndex' | 'nextStop' | 'etaMinutes' | 'lastUpdated'> & Partial<BusRoute>): BusRoute {
    const routes = this.getRoutes();
    const stops = newRoute.stops || [];
    const generatedPath = buildRoutePath(stops, newRoute.id);
    const fullRoute: BusRoute = {
      ...newRoute,
      id: newRoute.id || `route-${Date.now()}`,
      currentLocation: newRoute.currentLocation || (stops[0] ? stops[0].location : PEC_CAMPUS),
      path: generatedPath,
      currentStopIndex: 0,
      nextStop: stops[0]?.name || 'PEC College Campus',
      etaMinutes: 20,
      lastUpdated: 'Newly registered route'
    };
    routes.push(fullRoute);
    this.saveRoutes(routes);
    return fullRoute;
  }

  public updateRoute(routeId: string, updates: Partial<BusRoute>): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx] = { ...routes[idx], ...updates };
      if (updates.stops) {
        routes[idx].path = buildRoutePath(routes[idx].stops, routes[idx].id);
      }
      this.saveRoutes(routes);
    }
  }

  public deleteRoute(routeId: string): void {
    const routes = this.getRoutes().filter((r) => r.id !== routeId);
    this.saveRoutes(routes);
  }

  public addStop(routeId: string, stop: BusStop): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      const stops = [...routes[idx].stops];
      // Insert before campus destination if last stop is college campus
      if (stops.length > 0 && stops[stops.length - 1].name.toLowerCase().includes('college')) {
        stops.splice(stops.length - 1, 0, stop);
      } else {
        stops.push(stop);
      }
      routes[idx].stops = stops;
      routes[idx].path = buildRoutePath(stops, routes[idx].id);
      this.saveRoutes(routes);
    }
  }

  public updateStop(routeId: string, stopIndex: number, updatedStop: BusStop): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1 && routes[idx].stops[stopIndex]) {
      routes[idx].stops[stopIndex] = updatedStop;
      routes[idx].path = buildRoutePath(routes[idx].stops, routes[idx].id);
      this.saveRoutes(routes);
    }
  }

  public deleteStop(routeId: string, stopIndex: number): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1 && routes[idx].stops.length > 1) {
      routes[idx].stops.splice(stopIndex, 1);
      routes[idx].path = buildRoutePath(routes[idx].stops, routes[idx].id);
      this.saveRoutes(routes);
    }
  }

  public resetToOfficialPDFRoutes(): void {
    const init = INITIAL_ROUTES.map(initializeDefaultRoute);
    this.saveRoutes(init);
  }

  public startTrip(routeId: string, driverName?: string, phone?: string): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx].status = 'active';
      if (driverName) routes[idx].driver.name = driverName;
      if (phone) routes[idx].driver.phone = phone;
      routes[idx].lastUpdated = 'Trip started just now';
      this.saveRoutes(routes);
    }
  }

  public stopTrip(routeId: string): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx].status = 'completed';
      routes[idx].lastUpdated = 'Trip completed';
      this.saveRoutes(routes);
    }
  }

  public updateBusLocation(routeId: string, newLocation: [number, number], speed?: number, heading?: number): void {
    const routes = this.getRoutes();
    const idx = routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      routes[idx].status = 'active';
      routes[idx].currentLocation = newLocation;
      if (typeof speed === 'number') routes[idx].speedKmH = speed;
      if (typeof heading === 'number') routes[idx].heading = heading;
      routes[idx].lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
      id: `sos-${Date.now()}`,
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
      id: `ann-${Date.now()}`,
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
