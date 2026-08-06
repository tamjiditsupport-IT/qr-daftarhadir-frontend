import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useEffect } from 'react';
import echo from '../utils/echo';
import { ArrowLeft, Radio, CheckCircle, Clock, XCircle, Users, HeartPulse } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  Present: 'Hadir', Late: 'Terlambat', Sick: 'Sakit', Excused: 'Izin', Absent: 'Alfa',
};
const STATUS_COLORS: Record<string, string> = {
  Present: 'bg-green-500', Late: 'bg-orange-500', Sick: 'bg-blue-500', Excused: 'bg-purple-500', Absent: 'bg-red-500',
};

export default function MeetingMonitor() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting-monitor', id],
    queryFn: async () => {
      const res = await api.get(`/meetings/${id}`);
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!id) return;
    const channelName = `meeting.${id}`;
    const channel = echo.channel(channelName);
    channel.listen('AttendanceScanned', () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-monitor', id] });
    });
    return () => {
      channel.stopListening('AttendanceScanned');
      echo.leaveChannel(channelName);
    };
  }, [id, queryClient]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
    </div>
  );

  if (!meeting) return <div className="p-6 text-white">Rapat tidak ditemukan</div>;

  const logs = meeting.attendance_logs || [];
  const participants = meeting.participants || [];
  const total = participants.length;
  const presentCount = logs.filter((l: any) => l.status === 'Present').length;
  const lateCount = logs.filter((l: any) => l.status === 'Late').length;
  const excusedCount = logs.filter((l: any) => l.status === 'Excused').length;
  const sickCount = logs.filter((l: any) => l.status === 'Sick').length;
  const attended = presentCount + lateCount;
  const absentCount = total - attended - excusedCount - sickCount;
  const progress = total > 0 ? Math.round((attended / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <Link to={`/meetings/${id}`} className="flex items-center gap-2 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Kembali ke Detail
        </Link>
        <div className="flex items-center gap-2 text-green-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold">LIVE MONITORING</span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{meeting.title}</h1>
        <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{new Date(meeting.start_time).toLocaleString('id-ID')} · {meeting.type?.name}</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-300 font-medium">Progress Kehadiran</span>
          <span className="text-2xl font-bold text-green-400">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm mt-2">{attended} dari {total} peserta telah hadir</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', val: total, icon: <Users size={20}/>, c: 'text-blue-400 bg-blue-900/30 border-blue-800' },
          { label: 'Hadir', val: presentCount, icon: <CheckCircle size={20}/>, c: 'text-green-400 bg-green-900/30 border-green-800' },
          { label: 'Terlambat', val: lateCount, icon: <Clock size={20}/>, c: 'text-orange-400 bg-orange-900/30 border-orange-800' },
          { label: 'Izin/Sakit', val: excusedCount + sickCount, icon: <HeartPulse size={20}/>, c: 'text-purple-400 bg-purple-900/30 border-purple-800' },
          { label: 'Belum Hadir', val: Math.max(0, absentCount), icon: <XCircle size={20}/>, c: 'text-red-400 bg-red-900/30 border-red-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border flex items-center gap-3 ${s.c}`}>
            <div className="opacity-80">{s.icon}</div>
            <div>
              <div className="text-2xl font-bold">{s.val}</div>
              <div className="text-xs opacity-70">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
            <Radio size={16} className="text-green-400" />
            <h3 className="font-semibold">Scan Terbaru</h3>
          </div>
          <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
            {logs.slice().reverse().slice(0, 20).map((log: any) => (
              <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="font-medium text-sm">{log.asatidz?.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono">{log.asatidz?.id_asatidz}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${STATUS_COLORS[log.status] || 'bg-slate-600'}`}>
                    {STATUS_LABELS[log.status] || log.status}
                  </span>
                  <div className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{log.time}</div>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Belum ada scan masuk</div>}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
            <XCircle size={16} className="text-red-400" />
            <h3 className="font-semibold">Belum Hadir ({Math.max(0, absentCount)})</h3>
          </div>
          <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
            {participants.filter((p: any) => !logs.find((l: any) => l.asatidz_id === p.asatidz_id)).map((p: any) => (
              <div key={p.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-800 flex items-center justify-center text-red-400 text-xs font-bold flex-shrink-0">
                  {p.asatidz?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm">{p.asatidz?.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono">{p.asatidz?.id_asatidz}</p>
                </div>
              </div>
            ))}
            {attended >= total && <div className="px-6 py-12 text-center text-green-400 text-sm font-medium">Semua peserta sudah hadir!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
