import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, XCircle, FileSpreadsheet, FileText, Activity, HeartPulse, Radio, Upload, Trash2, UserCheck } from 'lucide-react';
import echo from '../utils/echo';

const STATUS_STYLES: Record<string, string> = {
  Present: 'bg-green-100 text-green-700',
  Late: 'bg-orange-100 text-orange-700',
  Sick: 'bg-blue-100 text-blue-700',
  Excused: 'bg-purple-100 text-purple-700',
  Absent: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  Present: 'Hadir', Late: 'Terlambat', Sick: 'Sakit',
  Excused: 'Izin', Absent: 'Alfa',
};

export default function MeetingDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [statusTarget, setStatusTarget] = useState<{ participantId: number; name: string } | null>(null);
  const [manualStatus, setManualStatus] = useState('Excused');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const { data: meeting, isLoading, refetch } = useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      const res = await api.get(`/meetings/${id}`);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (!id) return;
    const channelName = `meeting.${id}`;
    const channel = echo.channel(channelName);
    channel.listen('AttendanceScanned', () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', id] });
    });
    return () => {
      channel.stopListening('AttendanceScanned');
      echo.leaveChannel(channelName);
    };
  }, [id, queryClient]);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    setIsSubmitting(true);
    try {
      await api.post('/attendance/manual', {
        meeting_id: Number(id),
        asatidz_id: statusTarget.participantId,
        status: manualStatus,
      });
      setStatusTarget(null);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMeeting = async () => {
    if (!confirm('Apakah Anda yakin ingin memulai rapat ini?')) return;
    try { await api.post(`/meetings/${id}/start`); refetch(); }
    catch (err: any) { alert(err.response?.data?.message || 'Gagal memulai rapat'); }
  };

  const handleFinishMeeting = async () => {
    if (!confirm('Akhiri sesi rapat ini?')) return;
    try { await api.post(`/meetings/${id}/finish`); refetch(); }
    catch (err: any) { alert(err.response?.data?.message || 'Gagal mengakhiri rapat'); }
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const response = await api.get(`/meetings/${id}/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daftar_hadir_${id}.${type === 'excel' ? 'csv' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert(`Gagal mengunduh ${type.toUpperCase()}`); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/meetings/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      refetch();
      e.target.value = '';
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal mengunggah file'); }
    finally { setUploadingFile(false); }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Hapus lampiran ini?')) return;
    try { await api.delete(`/attachments/${attachmentId}`); refetch(); }
    catch (err: any) { alert('Gagal menghapus file'); }
  };

  if (isLoading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!meeting) return <div className="p-6">Rapat tidak ditemukan</div>;

  const totalParticipants = meeting.participants?.length || 0;
  const logs = meeting.attendance_logs || [];
  const presentCount = logs.filter((l: any) => l.status === 'Present').length;
  const lateCount = logs.filter((l: any) => l.status === 'Late').length;
  const sickCount = logs.filter((l: any) => l.status === 'Sick').length;
  const excusedCount = logs.filter((l: any) => l.status === 'Excused').length;
  const absentCount = totalParticipants - (presentCount + lateCount + sickCount + excusedCount);
  const attendedCount = presentCount + lateCount;
  const progress = totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0;

  const getLog = (asatidzId: number) => logs.find((l: any) => l.asatidz_id === asatidzId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{meeting.title}</h2>
            <div className="flex items-center gap-2 mt-1 mb-2">
              <span className="font-mono text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {meeting.meeting_code}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 flex flex-wrap gap-4 text-sm">
              <span>Tipe: <strong>{meeting.type?.name}</strong></span>
              <span>Waktu: <strong>{new Date(meeting.start_time).toLocaleString('id-ID')}</strong></span>
              <span>Toleransi Terlambat: <strong>{meeting.late_minutes} menit</strong></span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs ${meeting.status === 'running' ? 'bg-green-100 text-green-700' : meeting.status === 'finished' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : 'bg-blue-100 text-blue-700'}`}>
                {meeting.status === 'running' ? '● BERLANGSUNG' : meeting.status === 'finished' ? 'SELESAI' : 'TERJADWAL'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2">
              {meeting.status === 'scheduled' && (
                <button onClick={handleStartMeeting} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-medium text-sm">
                  ▶ Mulai Rapat
                </button>
              )}
              {meeting.status === 'running' && (
                <>
                  <Link to={`/meetings/${id}/monitor`} className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium text-sm">
                    <Radio size={16} /> Monitoring Live
                  </Link>
                  <button onClick={handleFinishMeeting} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium text-sm">
                    ⏹ Akhiri Rapat
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('excel')} className="flex items-center px-3 py-1.5 text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-200 font-medium">
                <FileSpreadsheet size={16} className="mr-1.5" /> Excel
              </button>
              <button onClick={() => handleExport('pdf')} className="flex items-center px-3 py-1.5 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded border border-rose-200 font-medium">
                <FileText size={16} className="mr-1.5" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">
            <span>Progress Kehadiran</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{attendedCount}/{totalParticipants} ({progress}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', val: totalParticipants, icon: <Users size={20}/>, color: 'text-blue-500 bg-blue-100' },
          { label: 'Hadir', val: presentCount, icon: <CheckCircle size={20}/>, color: 'text-green-500 bg-green-100' },
          { label: 'Terlambat', val: lateCount, icon: <Clock size={20}/>, color: 'text-orange-500 bg-orange-100' },
          { label: 'Izin/Sakit', val: sickCount + excusedCount, icon: <HeartPulse size={20}/>, color: 'text-blue-500 bg-blue-100' },
          { label: 'Alfa', val: absentCount, icon: <XCircle size={20}/>, color: 'text-red-500 bg-red-100' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{s.label}</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Lampiran Rapat */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText size={18} /> Lampiran Dokumen
          </h4>
          <div>
            <label className="cursor-pointer bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors inline-flex items-center gap-1">
              <Upload size={14} />
              {uploadingFile ? 'Mengunggah...' : 'Unggah File'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
            </label>
          </div>
        </div>
        <div className="p-4">
          {!meeting?.attachments || meeting.attachments.length === 0 ? (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">Belum ada lampiran.</div>
          ) : (
            <ul className="space-y-2">
              {meeting.attachments.map((file: any) => (
                <li key={file.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" size={20} />
                    <div>
                      <a href={`http://localhost:8000/api/v1/attachments/${file.id}/download`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                        {file.file_name}
                      </a>
                      <div className="text-xs text-slate-500">{(file.file_size / 1024).toFixed(1)} KB &bull; Diunggah oleh {file.uploader?.name}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAttachment(file.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Riwayat Rapat */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity size={18} /> Riwayat Perubahan Rapat
          </h4>
        </div>
        <div className="p-6">
          {!meeting?.histories || meeting.histories.length === 0 ? (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">Belum ada riwayat tercatat.</div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6">
              {meeting.histories.map((history: any, idx: number) => (
                <div key={history.id} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${idx === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{history.action}</span>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {new Date(history.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{history.description}</p>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <UserCheck size={12} /> {history.user?.name || 'Sistem'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daftar Hadir */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">Daftar Peserta & Status Kehadiran</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Klik "Ubah" untuk mengubah status secara manual</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Nama</th>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {meeting.participants?.map((p: any) => {
                const log = getLog(p.asatidz_id);
                const status = log?.status;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900/50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{p.asatidz?.id_asatidz}</td>
                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{p.asatidz?.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs">{log?.time || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status ? STATUS_STYLES[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : 'bg-red-50 text-red-500'}`}>
                        {status ? (STATUS_LABELS[status] || status) + (log?.late_duration_minutes > 0 ? ` (+${log.late_duration_minutes}m)` : '') : 'Belum Hadir'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => { setStatusTarget({ participantId: p.asatidz_id, name: p.asatidz?.name }); setManualStatus('Excused'); }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Ubah Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ubah Status */}
      {statusTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Ubah Status Kehadiran</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">{statusTarget.name}</p>
            <form onSubmit={handleStatusChange} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(['Present', 'Late', 'Excused', 'Sick', 'Absent'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setManualStatus(s)}
                    className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${manualStatus === s ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:border-slate-600'}`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setStatusTarget(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

