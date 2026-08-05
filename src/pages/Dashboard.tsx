import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Users, Home, Calendar, Clock } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">Selamat Datang di SIMAS</h3>
        <p className="text-slate-500 mt-2">
          Sistem Manajemen Kehadiran Asatidz Berbasis QR Code.
        </p>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Rapat Terbaru</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {data?.recent_meetings?.map((meeting: any) => (
            <div key={meeting.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">{meeting.title}</p>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Clock size={14} className="mr-1" />
                  {new Date(meeting.start_time).toLocaleString('id-ID')}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                {meeting.status}
              </span>
            </div>
          ))}
          {(!data?.recent_meetings || data.recent_meetings.length === 0) && (
            <div className="px-6 py-8 text-center text-slate-500">Belum ada rapat</div>
          )}
        </div>
      </div>
    </div>
  );
}
