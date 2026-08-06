import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { Users, Home, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Dashboard Analitik</h3>
          <p className="text-slate-500 mt-1">
            Ringkasan data kehadiran Asatidz dan statistik rapat bulan ini.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-500">Tingkat Kehadiran</div>
          <div className="text-3xl font-bold text-primary">{data?.percentage || 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
          <div className="p-2 bg-green-100 text-green-600 rounded-full mb-2"><CheckCircle size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{data?.stats?.present || 0}</div>
          <div className="text-xs font-medium text-slate-500">Hadir</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-full mb-2"><Clock size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{data?.stats?.late || 0}</div>
          <div className="text-xs font-medium text-slate-500">Terlambat</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-full mb-2"><AlertCircle size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{data?.stats?.permit || 0}</div>
          <div className="text-xs font-medium text-slate-500">Izin</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full mb-2"><Activity size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{data?.stats?.sick || 0}</div>
          <div className="text-xs font-medium text-slate-500">Sakit</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
          <div className="p-2 bg-red-100 text-red-600 rounded-full mb-2"><XCircle size={24} /></div>
          <div className="text-2xl font-bold text-slate-800">{data?.stats?.absent || 0}</div>
          <div className="text-xs font-medium text-slate-500">Alfa</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-6">Tren Kehadiran Rapat Terakhir</h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.chart_data || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Tidak Hadir" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="font-semibold text-slate-800">Scan Kehadiran Terbaru</h4>
            <div className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
            {data?.recent_scans?.map((scan: any) => (
              <div key={scan.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-slate-800">{scan.asatidz?.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">{scan.meeting?.title}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${scan.attendance_status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {scan.attendance_status === 'Present' ? 'HADIR' : 'TELAT'}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{new Date(scan.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
            {(!data?.recent_scans || data.recent_scans.length === 0) && (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada scan masuk</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Asatidz</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{data?.total_asatidz || 0}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg mr-4">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Rapat Bulan Ini</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{data?.total_meetings || 0}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
            <Home size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Unit</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{data?.total_units || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
