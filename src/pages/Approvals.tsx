import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Check, X, Clock } from 'lucide-react';

export default function Approvals() {
  const { data: approvals, isLoading, refetch } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const res = await api.get('/approvals');
      return res.data.data;
    }
  });

  const handleResolve = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      await api.post(`/approvals/${id}/resolve`, { status });
      refetch();
    } catch (err) {
      alert('Gagal memproses persetujuan');
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Persetujuan Kehadiran</h1>
          <p className="text-slate-500 mt-1">Kelola pengajuan Izin dan Sakit dari Asatidz</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Tanggal Pengajuan</th>
                <th className="px-6 py-4 font-medium">Asatidz</th>
                <th className="px-6 py-4 font-medium">Rapat</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvals?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {item.asatidz?.name} <br/>
                    <span className="text-xs text-slate-500 font-normal">{item.asatidz?.id_asatidz}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.meeting?.title}</td>
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
                          onClick={() => handleResolve(item.id, 'Approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Setujui"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleResolve(item.id, 'Rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Tolak"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
              {approvals?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada pengajuan persetujuan saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
