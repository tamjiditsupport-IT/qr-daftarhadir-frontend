import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useState } from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function MeetingDetail() {
  const { id } = useParams();
  const [selectedAsatidz, setSelectedAsatidz] = useState<number | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualStatus, setManualStatus] = useState('Sick');
  
  const { data: meeting, isLoading, refetch } = useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      const res = await api.get(`/meetings/${id}`);
      return res.data.data;
    }
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsatidz) return;
    
    try {
      await api.post('/approvals', {
        meeting_id: id,
        asatidz_id: selectedAsatidz,
        type: manualStatus, // Using type instead of status for approval request
        notes: "Pengajuan manual dari Dashboard"
      });
      setShowManualForm(false);
      alert('Pengajuan berhasil dikirim dan menunggu persetujuan');
      refetch();
    } catch (err) {
      alert('Gagal mengirim pengajuan');
    }
  };

  const handleStartMeeting = async () => {
    if (!confirm('Apakah Anda yakin ingin memulai rapat ini?')) return;
    try {
      await api.post(`/meetings/${id}/start`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memulai rapat');
    }
  };

  const handleFinishMeeting = async () => {
    if (!confirm('Apakah Anda yakin ingin mengakhiri rapat ini?')) return;
    try {
      await api.post(`/meetings/${id}/finish`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengakhiri rapat');
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!meeting) return <div className="p-6">Rapat tidak ditemukan</div>;

  const totalParticipants = meeting.participants?.length || 0;
  const logs = meeting.attendance_logs || [];
  const presentCount = logs.filter((l: any) => l.status === 'Present').length;
  const lateCount = logs.filter((l: any) => l.status === 'Late').length;
  const absentCount = totalParticipants - (presentCount + lateCount);

  const getLog = (asatidzId: number) => {
    return logs.find((l: any) => l.asatidz_id === asatidzId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{meeting.title}</h2>
          <div className="text-slate-500 mt-2 flex space-x-4">
            <span>Tipe: {meeting.type?.name}</span>
            <span>Waktu: {new Date(meeting.start_time).toLocaleString('id-ID')}</span>
            <span className="capitalize font-semibold">Status: {meeting.status}</span>
          </div>
        </div>
        <div>
          {meeting.status === 'scheduled' && (
            <button 
              onClick={handleStartMeeting}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-medium"
            >
              Mulai Rapat
            </button>
          )}
          {meeting.status === 'running' && (
            <button 
              onClick={handleFinishMeeting}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
            >
              Akhiri Rapat
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <Users className="text-blue-500 mr-3" />
          <div>
            <div className="text-xs text-slate-500">Total Peserta</div>
            <div className="text-xl font-bold">{totalParticipants}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <CheckCircle className="text-green-500 mr-3" />
          <div>
            <div className="text-xs text-slate-500">Tepat Waktu</div>
            <div className="text-xl font-bold">{presentCount}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <Clock className="text-orange-500 mr-3" />
          <div>
            <div className="text-xs text-slate-500">Terlambat</div>
            <div className="text-xl font-bold">{lateCount}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <XCircle className="text-red-500 mr-3" />
          <div>
            <div className="text-xs text-slate-500">Belum Hadir / Absen</div>
            <div className="text-xl font-bold">{absentCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Daftar Hadir</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">ID Asatidz</th>
                <th className="px-6 py-4 font-medium">Nama</th>
                <th className="px-6 py-4 font-medium">Waktu Hadir</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meeting.participants?.map((p: any) => {
                const log = getLog(p.asatidz_id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{p.asatidz?.id_asatidz}</td>
                    <td className="px-6 py-4 text-slate-600">{p.asatidz?.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {log ? log.time : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {log ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'Present' ? 'bg-green-100 text-green-700' :
                          log.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {log.status} {log.late_duration_minutes > 0 ? `(+${log.late_duration_minutes}m)` : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          Belum Hadir
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedAsatidz(p.asatidz_id);
                          setShowManualForm(true);
                        }}
                        className="text-primary hover:text-primary-dark font-medium text-sm"
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

      {showManualForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Input Kehadiran Manual</h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Status Baru</label>
                <select 
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary outline-none bg-white"
                >
                  <option value="Sick">Sakit (Sick)</option>
                  <option value="Excused">Izin (Excused)</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark">
                  Simpan
                </button>
                <button type="button" onClick={() => setShowManualForm(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200">
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
