import { useState } from 'react';
import {
  Bus,
  User,
  Shield,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  QrCode,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';
import { busStore } from '../services/busData';

interface LoginPageProps {
  onLogin: (role: 'driver' | 'student' | 'admin', info: any) => void;
  onOpenQrTrip?: (routeId?: string) => void;
}

// Verified demo student directory for Prathyusha Engineering College (Official 2026 Routes)
const DEMO_STUDENTS = [
  {
    regNo: '211422104021',
    name: 'Dinesh Kumar S',
    dept: 'B.E. Computer Science (Final Year)',
    routeId: 'RNo:12',
    pickupStop: 'Velachery',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104045',
    name: 'Keerthana M',
    dept: 'B.Tech. Artificial Intelligence',
    routeId: 'RNo:31',
    pickupStop: 'Madravoyal-Ration Shop',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104088',
    name: 'Rahul R',
    dept: 'B.E. Electronics & Communication',
    routeId: 'RNo:09',
    pickupStop: 'Ambattur OT',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104099',
    name: 'Priya S',
    dept: 'B.Tech. Information Technology',
    routeId: 'RNo:5',
    pickupStop: 'Sri perambudur',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104112',
    name: 'Gowtham V',
    dept: 'B.E. Mechanical Engineering',
    routeId: 'RNo:8',
    pickupStop: 'Gummidipoondi',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104130',
    name: 'Sivaranjani K',
    dept: 'B.Tech. Cyber Security',
    routeId: 'RNo:30',
    pickupStop: 'Thiruvallur',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104142',
    name: 'Akash B',
    dept: 'B.E. Electrical & Electronics',
    routeId: 'RNo:11',
    pickupStop: 'Tiruttani',
    password: 'pecstudent2026'
  },
  {
    regNo: '211422104155',
    name: 'Subramanian N',
    dept: 'B.Tech. Computer Science & Business',
    routeId: 'RNo:36',
    pickupStop: 'Tambaram',
    password: 'pecstudent2026'
  }
];

export default function LoginPage({ onLogin, onOpenQrTrip }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'driver' | 'student' | 'admin'>('student');

  // Traditional Student Credentials
  const [studentRegNo, setStudentRegNo] = useState('211422104021');
  const [studentPassword, setStudentPassword] = useState('pecstudent2026');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Driver Credentials
  const [driverRouteId, setDriverRouteId] = useState('RNo:12');

  // Admin Credentials
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const routes = busStore.getRoutes();

  // Handle Traditional Student Login
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentRegNo.trim()) {
      toast.error('Please enter your Student Register Number');
      return;
    }

    if (!studentPassword.trim()) {
      toast.error('Please enter your account password');
      return;
    }

    // Check if known student account or generic valid student
    const matched = DEMO_STUDENTS.find(
      (s) => s.regNo.toLowerCase() === studentRegNo.trim().toLowerCase()
    );

    // Accept demo password or default 'pecstudent2026' or matching record
    if (studentPassword === 'pecstudent2026' || (matched && matched.password === studentPassword)) {
      const studentData = matched || {
        regNo: studentRegNo.trim(),
        name: 'PEC Student',
        dept: 'B.E. Engineering',
        routeId: 'route-2',
        pickupStop: 'Chromepet'
      };

      const assignedRoute = routes.find((r) => r.id === studentData.routeId) || routes[1] || routes[0];

      onLogin('student', {
        registerNumber: studentData.regNo,
        name: studentData.name,
        department: studentData.dept,
        routeId: assignedRoute.id,
        routeName: assignedRoute.routeName,
        routeNumber: assignedRoute.routeNumber,
        pickupStop: studentData.pickupStop
      });

      toast.success(`Welcome back, ${studentData.name}! Live bus tracking activated.`);
    } else {
      toast.error('Invalid Register Number or Password. Use demo password: pecstudent2026');
    }
  };

  const handleSelectDemoStudent = (student: typeof DEMO_STUDENTS[0]) => {
    setStudentRegNo(student.regNo);
    setStudentPassword(student.password);
    toast.info(`Loaded demo credentials for ${student.name} (${student.regNo})`);
  };

  // Handle Driver Login
  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const route = routes.find((r) => r.id === driverRouteId) || routes[0];
    onLogin('driver', {
      routeId: route.id,
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      driverName: route.driver.name,
      phone: route.driver.phone,
      busNumber: route.busNumber
    });
    toast.success(`Driver console opened for ${route.driver.name} (${route.routeNumber})`);
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'pecadmin2026') {
      onLogin('admin', { role: 'admin', user: 'Central Fleet Dispatcher' });
      toast.success('Admin authorization verified');
    } else {
      toast.error('Invalid admin credentials. Use demo password: pecadmin2026');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100/80 flex flex-col justify-between p-3 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 sm:py-4">
        <Logo size="md" variant="maroon" />
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            GPS Transit Server Online
          </span>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="w-full max-w-lg mx-auto my-auto py-3">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all">
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-950 text-white p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-widest uppercase text-maroon-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                Prathyusha Smartbus
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Transit Portal
            </h1>
            <p className="text-xs sm:text-sm text-maroon-100 mt-1 max-w-sm">
              Sign in with your institutional credentials to track your college bus continuously like Rapido & Ola.
            </p>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-maroon-950/60 rounded-2xl mt-5 border border-white/10">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'student'
                    ? 'bg-white text-maroon-950 shadow-md'
                    : 'text-maroon-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'driver'
                    ? 'bg-white text-maroon-950 shadow-md'
                    : 'text-maroon-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-white text-maroon-950 shadow-md'
                    : 'text-maroon-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Quick Driver QR Dispatch Banner */}
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold">Driver Onboard? Scan QR to share live GPS</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenQrTrip && onOpenQrTrip()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] shadow-sm flex items-center gap-1 transition-all active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR ➔</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 pt-4">
            {/* 1. TRADITIONAL STUDENT LOGIN */}
            {selectedRole === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                {/* 1-Click Demo Profiles Pill */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1.5 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Demo Accounts (1-Click Fill):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_STUDENTS.map((st) => (
                      <button
                        key={st.regNo}
                        type="button"
                        onClick={() => handleSelectDemoStudent(st)}
                        className="px-2 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 font-mono text-[11px] font-bold text-amber-900 transition-colors"
                      >
                        {st.regNo} ({st.name.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Register Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Register Number</span>
                    <span className="text-[11px] text-slate-400 font-normal">Anna Univ Reg No</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={studentRegNo}
                      onChange={(e) => setStudentRegNo(e.target.value)}
                      placeholder="e.g. 211422104021"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:border-maroon-700 focus:ring-2 focus:ring-maroon-700/20 text-slate-900 font-mono font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Password Input with Show/Hide Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] font-mono text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded border border-maroon-200">
                      Default: pecstudent2026
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showStudentPassword ? 'text' : 'password'}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Enter student portal password"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-300 focus:border-maroon-700 focus:ring-2 focus:ring-maroon-700/20 text-slate-900 font-medium text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-maroon-700 focus:ring-maroon-700/20 border-slate-300"
                    />
                    <span>Remember Register No.</span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full mt-3 py-3.5 px-4 bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold rounded-2xl shadow-lg shadow-maroon-700/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>Sign In & Track Bus (Live GPS)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 2. DRIVER LOGIN */}
            {selectedRole === 'driver' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-amber-950 text-xs space-y-2">
                  <div className="font-black flex items-center gap-1.5 text-amber-900 text-sm">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <span>Driver QR Dispatch Flow</span>
                  </div>
                  <p className="text-amber-900 leading-relaxed text-xs">
                    When the driver scans the QR code sticker on the bus, the system will ask for the <strong>Driver's Name</strong>, <strong>Route Number</strong>, and prompt to <strong>Share GPS Location</strong> for real-time tracking.
                  </p>
                </div>

                {/* Primary Action: Launch Driver QR Trip Starter */}
                <button
                  type="button"
                  onClick={() => onOpenQrTrip && onOpenQrTrip(driverRouteId)}
                  className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-sm"
                >
                  <Radio className="w-5 h-5 text-white animate-pulse" />
                  <span>Scan Bus QR & Share GPS Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase">
                    or direct console login
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form onSubmit={handleDriverSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Bus Route
                    </label>
                    <select
                      value={driverRouteId}
                      onChange={(e) => setDriverRouteId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-maroon-700 focus:ring-2 focus:ring-maroon-700/20 text-slate-900 font-bold text-sm bg-white"
                    >
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.routeNumber} – {r.routeName} ({r.busNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Bus className="w-4 h-4" />
                    <span>Open Assigned Bus Driver Console</span>
                  </button>
                </form>
              </div>
            )}

            {/* 3. ADMIN LOGIN */}
            {selectedRole === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Master Password
                    </label>
                    <span className="text-[11px] font-mono text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded border border-maroon-200">
                      Demo: pecadmin2026
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-300 focus:border-maroon-700 focus:ring-2 focus:ring-maroon-700/20 text-slate-900 font-medium text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Shield className="w-4 h-4" />
                  <span>Access Fleet Command</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center py-2 text-xs text-slate-500">
        <p>Prathyusha Engineering College © 2026 • Transport Management System</p>
      </footer>
    </div>
  );
}