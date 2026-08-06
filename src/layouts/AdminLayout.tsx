import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, Users as UsersIcon, LayoutDashboard, ClipboardCheck, 
  Database, UserCog, Activity, Calendar, BarChart2, Settings,
  ChevronRight, Home, Shield, Sun, Moon
} from 'lucide-react';
import api from '../utils/axios';
import { useTheme } from '../contexts/ThemeContext';

const menuGroups = [
  {
    label: 'Utama',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Kalender Rapat', path: '/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { name: 'Asatidz', path: '/asatidz', icon: UsersIcon },
      { name: 'Rapat', path: '/meetings', icon: Home },
      { name: 'Approvals', path: '/approvals', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Analitik',
    items: [
      { name: 'Laporan', path: '/reports', icon: BarChart2 },
    ],
  },
  {
    label: 'Konfigurasi',
    items: [
      { name: 'Master Data', path: '/master-data', icon: Database },
      { name: 'Pengaturan User', path: '/users', icon: UserCog },
      { name: 'Role & Permission', path: '/roles-permissions', icon: Shield },
      { name: 'Catatan Sistem', path: '/audit-logs', icon: Activity },
      { name: 'Pengaturan Sistem', path: '/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex shadow-sm transition-colors duration-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h1 className="text-lg font-bold text-primary-dark dark:text-primary leading-tight">SIMAS</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-5 px-3">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all group text-sm ${
                          isActive 
                            ? 'bg-primary text-white font-semibold shadow-sm' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                        <span className="flex-1">{item.name}</span>
                        {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {user.name && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 shadow-sm flex-shrink-0 transition-colors duration-200 justify-between">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {menuGroups.flatMap(g => g.items).find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'SIMAS'}
            </h2>
          </div>
          <div>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
