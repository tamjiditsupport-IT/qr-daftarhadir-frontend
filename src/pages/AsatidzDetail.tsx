import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { ArrowLeft, User, Phone, Building, Briefcase, CheckCircle, Clock, XCircle, HeartPulse, Download } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { Present: 'Hadir', Late: 'Terlambat', Sick: 'Sakit', Excused: 'Izin', Absent: 'Alfa' };
const STATUS_STYLES: Record<string, string> = {
  Present: 'bg-green-100 text-green-700',
  Late: 'bg-orange-100 text-orange-700',
  Sick: 'bg-blue-100 text-blue-700',
  Excused: 'bg-purple-100 text-purple-700',
  Absent: 'bg-red-100 text-red-700',
};

export default function AsatidzDetail() {
  const { id } = useParams();

  const { data: asatidz, isLoading } = useQuery({
    queryKey: ['asatidz-detail', id],
    queryFn: async () => {
      const res = await api.get(`/asatidz/${id}`);
      return res.data.data;
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['asatidz-history', id],
    queryFn: async () => {
      const res = await api.get(`/asatidz/${id}/history`);
      return res.data.data;
    },
  });

  const { data: qrData } = useQuery({
    queryKey: ['qr-card', id],
    queryFn: async () => {
      const res = await api.get(`/qr/${id}`);
      return res.data;
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!asatidz) return <div className="p-6">Asatidz tidak ditemukan</div>;

  const history = historyData || [];
  const totalMeetings = history.length;
  const presentCount = history.filter((h: any) => h.attendance_status === 'Present').length;
  const lateCount = history.filter((h: any) => h.attendance_status === 'Late').length;
  const excusedCount = history.filter((h: any) => h.attendance_status === 'Excused').length;
  const sickCount = history.filter((h: any) => h.attendance_status === 'Sick').length;
  const absentCount = history.filter((h: any) => h.attendance_status === 'Absent' || !h.attendance_status).length;
  const attendanceRate = totalMeetings > 0 ? Math.round(((presentCount + lateCount) / totalMeetings) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/asatidz" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-primary text-sm">
        <ArrowLeft size={16} /> Kembali ke Daftar Asatidz
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {asatidz.photo ? (
              <img src={`/storage/${asatidz.photo}`} alt={asatidz.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-primary/20">
                <User size={40} className="text-primary" />
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{asatidz.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono text-sm mt-1">{asatidz.id_asatidz}</p>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${asatidz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {asatidz.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            {asatidz.phone && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Phone size={16} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span>{asatidz.phone}</span>
              </div>
            )}
            {asatidz.unit && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Building size={16} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span>{asatidz.unit?.name}</span>
              </div>
            )}
            {asatidz.position && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Briefcase size={16} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span>{asatidz.position?.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats + QR */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Statistik Kehadiran</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Total Rapat', val: totalMeetings, icon: <CheckCircle size={18}/>, color: 'text-blue-600 bg-blue-100' },
                { label: 'Hadir', val: presentCount, icon: <CheckCircle size={18}/>, color: 'text-green-600 bg-green-100' },
                { label: 'Terlambat', val: lateCount, icon: <Clock size={18}/>, color: 'text-orange-600 bg-orange-100' },
                { label: 'Izin', val: excusedCount, icon: <HeartPulse size={18}/>, color: 'text-purple-600 bg-purple-100' },
                { label: 'Sakit', val: sickCount, icon: <HeartPulse size={18}/>, color: 'text-blue-600 bg-blue-100' },
                { label: 'Alfa', val: absentCount, icon: <XCircle size={18}/>, color: 'text-red-600 bg-red-100' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>{s.icon}</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">
                <span>Tingkat Kehadiran</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${attendanceRate >= 80 ? 'bg-green-500' : attendanceRate >= 60 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${attendanceRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* QR Card */}
          {qrData && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">QR Card</h3>
                <a href={`/api/qr/${id}`} download className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium">
                  <Download size={16} /> Unduh QR
                </a>
              </div>
              <div className="flex items-center gap-4">
                <img src={qrData.qr_image_url || `/api/qr/${id}`} alt="QR Code" className="w-32 h-32 border border-slate-200 dark:border-slate-700 rounded-lg" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Kode QR</p>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-100 text-lg">{qrData.qr_code || asatidz.id_asatidz}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Berlaku seumur hidup</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Riwayat Kehadiran Rapat</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-medium">Judul Rapat</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Waktu Hadir</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Belum ada riwayat kehadiran</td></tr>
              ) : history.map((h: any) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900/50">
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">
                    <Link to={`/meetings/${h.meeting_id}`} className="hover:text-primary hover:underline">{h.meeting?.title}</Link>
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs">{h.meeting?.start_time ? new Date(h.meeting.start_time).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs font-mono">{h.attendance_log?.time || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[h.attendance_status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {STATUS_LABELS[h.attendance_status] || h.attendance_status || 'Belum Hadir'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
