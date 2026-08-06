import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Check, X, Clock, Edit2 } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';

export default function Approvals() {
  const [resolveModal, setResolveModal] = useState<{ id: number; status: 'Approved' | 'Rejected', currentAsatidzId: number, type: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedAsatidz, setSelectedAsatidz] = useState<any>(null);

  const { data: approvals, isLoading, refetch } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const res = await api.get('/approvals');
      return res.data.data;
    }
  });

  const { data: asatidzList } = useQuery({
    queryKey: ['asatidz-options'],
    queryFn: async () => {
      const res = await api.get('/asatidz');
      return res.data.data;
    }
  });

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModal) return;
    try {
      const payload: any = { status: resolveModal.status, notes };
      if (resolveModal.status === 'Approved' && selectedAsatidz && selectedAsatidz.value !== resolveModal.currentAsatidzId) {
        payload.asatidz_id = selectedAsatidz.value;
      }
      
      await api.post(`/approvals/${resolveModal.id}/resolve`, payload);
      setResolveModal(null);
      setNotes('');
      setSelectedAsatidz(null);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses persetujuan');
    }
  };

  const asatidzOptions = asatidzList?.map((a: any) => ({
    value: a.id,
    label: `${a.name} (${a.id_asatidz})`
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Persetujuan Kehadiran</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Kelola pengajuan Izin, Sakit, dan revisi kehadiran</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Tanggal Pengajuan</th>
                <th className="px-6 py-4 font-medium">Asatidz</th>
                <th className="px-6 py-4 font-medium">Rapat</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                 <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Memuat data...</td></tr>
              ) : approvals?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Tidak ada pengajuan persetujuan saat ini.</td></tr>
              ) : (
                approvals?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900/50">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                      {item.asatidz?.name} <br/>
                      <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal">{item.asatidz?.id_asatidz}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.meeting?.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'Sick' ? 'bg-orange-100 text-orange-700' :
                        item.type === 'Attendance' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type === 'Sick' ? 'Sakit' : item.type === 'Attendance' ? 'Hadir (Lintas Unit)' : 'Izin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'Pending' && (
                        <span className="flex items-center text-orange-600 text-xs font-medium">
                          <Clock size={14} className="mr-1"/> Menunggu
                        </span>
                      )}
                      {item.status === 'Approved' && (
                        <span className="flex items-center text-green-600 text-xs font-medium">
                          <Check size={14} className="mr-1"/> Disetujui
                        </span>
                      )}
                      {item.status === 'Rejected' && (
                        <span className="flex items-center text-red-600 text-xs font-medium">
                          <X size={14} className="mr-1"/> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'Pending' ? (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              setResolveModal({ id: item.id, status: 'Approved', currentAsatidzId: item.asatidz_id, type: item.type });
                              setSelectedAsatidz({ value: item.asatidz_id, label: `${item.asatidz?.name} (${item.asatidz?.id_asatidz})` });
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Setujui (Bisa Revisi Peserta)"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => setResolveModal({ id: item.id, status: 'Rejected', currentAsatidzId: item.asatidz_id, type: item.type })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {resolveModal.status === 'Approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
              </h3>
              <button onClick={() => setResolveModal(null)} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleResolve} className="space-y-4">
              {resolveModal.status === 'Approved' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Revisi Peserta <span className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal">(Opsional)</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">Ubah peserta jika ada kesalahan identifikasi.</p>
                  <Select
                    options={asatidzOptions}
                    value={selectedAsatidz}
                    onChange={setSelectedAsatidz}
                    placeholder="Cari asatidz..."
                    className="text-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Catatan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Opsional..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none min-h-[100px]"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setResolveModal(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" className={`flex-1 text-white py-2 rounded-lg font-medium transition-colors ${resolveModal.status === 'Approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  Konfirmasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
