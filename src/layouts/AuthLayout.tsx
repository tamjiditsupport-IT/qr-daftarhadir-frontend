import { Outlet, Navigate } from 'react-router-dom';

export default function AuthLayout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">SIMAS</h1>
          <p className="text-slate-500 mt-2">Sistem Manajemen Kehadiran Asatidz</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
