import { Outlet, Navigate } from 'react-router-dom';

export default function AuthLayout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col justify-center items-center md:w-1/2 bg-gradient-to-br from-primary-dark via-primary to-blue-500 p-12 text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-10 -right-10 w-72 h-72 rounded-full bg-blue-300 blur-3xl mix-blend-overlay"></div>
        </div>

        <div className="z-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">SIMAS</h1>
          <p className="text-lg text-blue-50 max-w-sm mx-auto font-light leading-relaxed">
            Sistem Manajemen Kehadiran Asatidz Terpadu. Tingkatkan efisiensi absensi dengan teknologi cerdas.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden absolute top-8 left-0 right-0 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">SIMAS</h1>
        </div>

        <div className="w-full max-w-md mt-16 md:mt-0">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 p-8 sm:p-10">
            <Outlet />
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
            &copy; {new Date().getFullYear()} SIMAS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
