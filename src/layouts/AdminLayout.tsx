import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, Users as UsersIcon, LayoutDashboard, ClipboardCheck, 
  Database, UserCog, Activity, Calendar, BarChart2, Settings,
  ChevronRight, Home, Shield, Sun, Moon, Bell, Search
} from 'lucide-react';
import api from '../utils/axios';
import { useTheme } from '../contexts/ThemeContext';
import echo from '../utils/echo';

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
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{meetings: any[], asatidz: any[], units: any[]} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    if (token) {
      api.get('/notifications').then(res => {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unread_count);
      }).catch(console.error);

      if (user?.id) {
        echo.private(`App.Models.User.${user.id}`)
          .notification((notification: any) => {
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [
              {
                id: notification.id,
                data: { title: notification.title, message: notification.message },
                read_at: null,
                created_at: new Date().toISOString()
              },
              ...prev
            ] as never[]);
          });
      }
    }
    
    return () => {
      if (user?.id) {
        echo.leave(`App.Models.User.${user.id}`);
      }
    };
  }, [token, user?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      api.get(`/search?q=${searchQuery}`).then(res => {
        setSearchResults(res.data.data);
      }).finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 shadow-sm flex-shrink-0 transition-colors duration-200 justify-between z-10">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {menuGroups.flatMap(g => g.items).find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'SIMAS'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center"
              title="Search (Ctrl+K)"
            >
              <Search size={20} />
              <span className="hidden sm:inline ml-2 text-xs border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5">Ctrl K</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Notifikasi</span>
                    <button onClick={() => {
                      api.post('/notifications/mark-all-read').then(() => {
                        setUnreadCount(0);
                        setNotifications(notifications.map((n:any) => ({...n, read_at: new Date()})));
                      });
                    }} className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Tidak ada notifikasi.</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n.id} className={`p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${!n.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onClick={() => {
                          if (!n.read_at) {
                            api.post(`/notifications/${n.id}/mark-read`).then(() => {
                              setUnreadCount(prev => Math.max(0, prev - 1));
                              setNotifications(notifications.map((not:any) => not.id === n.id ? {...not, read_at: new Date()} : not));
                            });
                          }
                        }}>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{n.data.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.data.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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

      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[100] p-4 pt-20">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
              <Search className="text-slate-400 mr-3" size={24} />
              <input 
                type="text" 
                autoFocus 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari asatidz, rapat, atau unit..." 
                className="flex-1 bg-transparent text-lg text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400"
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null); }} className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 ml-3 hover:bg-slate-100 dark:hover:bg-slate-700">ESC</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching && (
                <div className="p-8 text-center text-slate-500">Mencari...</div>
              )}
              {!isSearching && searchResults && (
                <div className="py-2">
                  {searchResults.meetings.length > 0 && (
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Rapat</h3>
                      {searchResults.meetings.map(m => (
                        <Link to={`/meetings/${m.id}`} onClick={() => setShowSearch(false)} key={`m-${m.id}`} className="block px-3 py-2 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{m.title}</div>
                          <div className="text-xs text-slate-500 font-mono">{m.meeting_code}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.asatidz.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Asatidz</h3>
                      {searchResults.asatidz.map(a => (
                        <Link to={`/asatidz`} onClick={() => setShowSearch(false)} key={`a-${a.id}`} className="block px-3 py-2 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{a.name}</div>
                          <div className="text-xs text-slate-500">{a.niy}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.units.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Unit</h3>
                      {searchResults.units.map(u => (
                        <Link to={`/master-data`} onClick={() => setShowSearch(false)} key={`u-${u.id}`} className="block px-3 py-2 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{u.name}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {(searchResults.meetings.length === 0 && searchResults.asatidz.length === 0 && searchResults.units.length === 0) && (
                    <div className="p-8 text-center text-slate-500">Tidak ada hasil ditemukan.</div>
                  )}
                </div>
              )}
              {!searchQuery && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Ketikkan sesuatu untuk mulai mencari
                </div>
              )}
            </div>
          </div>
          {/* Invisible backdrop click catcher */}
          <div className="absolute inset-0 z-[-1]" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null); }}></div>
        </div>
      )}
    </div>
  );
}
