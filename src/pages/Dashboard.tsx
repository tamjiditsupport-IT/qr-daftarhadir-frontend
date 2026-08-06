import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { Users, Home, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { useEffect } from 'react';
import echo from '../utils/echo';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    // We can remove refetchInterval now since we use WebSockets!
    // refetchInterval: 10000 
  });

  useEffect(() => {
    const channel = echo.channel('attendance.scans');
    
    channel.listen('AttendanceScanned', (e: any) => {
      console.log('New scan received on Dashboard:', e);
      // Invalidate the query to fetch fresh stats
      // Or manually update the cache for better performance
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    return () => {
      channel.stopListening('AttendanceScanned');
      echo.leaveChannel('attendance.scans');
    };
  }, [queryClient]);

  if (isLoading) return <div className="p-6 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-600 dark:from-indigo-900 dark:to-slate-800 p-8 rounded-2xl shadow-xl shadow-primary/20 flex justify-between items-center text-white border border-white/10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold tracking-tight">Dashboard Analitik</h3>
          <p className="text-blue-100/90 dark:text-indigo-200/80 mt-2 text-sm max-w-md font-medium">
            Ringkasan data kehadiran Asatidz dan statistik rapat bulan ini.
          </p>
        </div>
        <div className="text-right relative z-10">
          <div className="text-sm font-semibold text-blue-100/90 dark:text-indigo-200/80 mb-1 tracking-wide uppercase">Tingkat Kehadiran</div>
          <div className="text-5xl font-extrabold tracking-tighter">{data?.percentage || 0}<span className="text-3xl font-bold text-blue-200/80">%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex flex-col justify-center items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
          <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-600 dark:text-green-400 rounded-xl mb-3 shadow-inner group-hover:scale-110 transition-transform"><CheckCircle size={26} strokeWidth={2.5} /></div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.stats?.present || 0}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Hadir</div>
        </div>
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex flex-col justify-center items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-600 dark:text-orange-400 rounded-xl mb-3 shadow-inner group-hover:scale-110 transition-transform"><Clock size={26} strokeWidth={2.5} /></div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.stats?.late || 0}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Terlambat</div>
        </div>
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex flex-col justify-center items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-600 dark:text-blue-400 rounded-xl mb-3 shadow-inner group-hover:scale-110 transition-transform"><AlertCircle size={26} strokeWidth={2.5} /></div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.stats?.permit || 0}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Izin</div>
        </div>
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex flex-col justify-center items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
          <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 text-yellow-600 dark:text-yellow-400 rounded-xl mb-3 shadow-inner group-hover:scale-110 transition-transform"><Activity size={26} strokeWidth={2.5} /></div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.stats?.sick || 0}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Sakit</div>
        </div>
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex flex-col justify-center items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
          <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-600 dark:text-red-400 rounded-xl mb-3 shadow-inner group-hover:scale-110 transition-transform"><XCircle size={26} strokeWidth={2.5} /></div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.stats?.absent || 0}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Alfa</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6 text-lg flex items-center gap-2">
            <BarChart2 className="text-primary" size={20} />
            Tren Kehadiran Rapat Terakhir
          </h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.chart_data || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Hadir" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                <Bar dataKey="Tidak Hadir" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="text-primary" size={18} />
              Scan Terbaru
            </h4>
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 overflow-y-auto max-h-72 custom-scrollbar">
            {data?.recent_scans?.map((scan: any) => (
              <div key={scan.id} className="px-6 py-4 flex items-center justify-between hover:bg-primary/5 dark:hover:bg-slate-700/50 transition-colors group cursor-default">
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{scan.asatidz?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[150px]">{scan.meeting?.title}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${scan.attendance_status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                    {scan.attendance_status === 'Present' ? 'HADIR' : 'TELAT'}
                  </span>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5">{new Date(scan.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
            {(!data?.recent_scans || data.recent_scans.length === 0) && (
              <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Users size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada scan masuk</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl mr-5 group-hover:scale-110 transition-transform">
            <Users size={28} strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Asatidz</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{data?.total_asatidz || 0}</div>
          </div>
        </div>
        
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl mr-5 group-hover:scale-110 transition-transform">
            <Calendar size={28} strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rapat Bulan Ini</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{data?.total_meetings || 0}</div>
          </div>
        </div>

        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 flex items-center hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl mr-5 group-hover:scale-110 transition-transform">
            <Home size={28} strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Unit</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{data?.total_units || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
