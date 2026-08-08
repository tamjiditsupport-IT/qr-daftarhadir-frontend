import { Outlet, Navigate } from 'react-router-dom';

export default function AuthLayout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col justify-center items-start md:w-[55%] bg-[#2b39c0] p-12 lg:p-20 text-white relative overflow-hidden">
        {/* Abstract Background Shapes (Optional lines) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <svg viewBox="0 0 800 800" className="w-full h-full absolute top-0 left-0" xmlns="http://www.w3.org/2000/svg">
              <circle cx="0" cy="800" r="400" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="0" cy="800" r="500" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="0" cy="800" r="600" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="0" cy="800" r="700" fill="none" stroke="white" strokeWidth="1"/>
           </svg>
        </div>

        <div className="z-10 w-full max-w-xl">
          <img src="/src/assets/ICONIC.png" alt="Icon" className="w-16 h-16 mb-12 brightness-0 invert" />
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 drop-shadow-sm leading-tight">SIMAS 👋</h1>
          <p className="text-lg lg:text-xl text-blue-100 font-light leading-relaxed max-w-md">
            Sistem Manajemen Kehadiran Asatidz Terpadu. Tingkatkan efisiensi absensi dengan teknologi cerdas.
          </p>
        </div>

        <div className="absolute bottom-8 left-12 lg:left-20 z-10">
          <p className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} SIMAS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-24 relative bg-white dark:bg-slate-900">
        
        <div className="w-full max-w-md mx-auto">
          {/* Brand Name aligned with form */}
          <div className="mb-14">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">SIMAS</h1>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}
