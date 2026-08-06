import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users as UsersIcon, LayoutDashboard, ClipboardCheck, Database, UserCog } from 'lucide-react';
import api from '../utils/axios';

export default function AdminLayout() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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

  const menu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pengaturan User', path: '/users', icon: UserCog },
    { name: 'Asatidz', path: '/asatidz', icon: UsersIcon },
    { name: 'Meetings', path: '/meetings', icon: Home },
    { name: 'Approvals', path: '/approvals', icon: ClipboardCheck },
    { name: 'Master Data', path: '/master-data', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary-dark">SIMAS Admin</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors group"
                >
                  <Icon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-primary" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-800">Admin Panel</h2>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
