import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function Asatidz() {
  const [showForm, setShowForm] = useState(false);
  
  const { data: asatidz, isLoading, refetch } = useQuery({
    queryKey: ['asatidz'],
    queryFn: async () => {
      const res = await api.get('/asatidz');
      return res.data.data;
    }
  });

  const [formData, setFormData] = useState({
    id_asatidz: '',
    name: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/asatidz', formData);
      setFormData({ id_asatidz: '', name: '', phone: '' });
      setShowForm(false);
      refetch();
    } catch (err) {
      alert("Gagal menambahkan data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Asatidz</h2>
          <p className="text-slate-500 mt-1">Manajemen data ustadz dan QR Code</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tambah Asatidz
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Form Tambah Asatidz</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID / NIP</label>
              <input
                type="text"
                required
                value={formData.id_asatidz}
                onChange={e => setFormData({...formData, id_asatidz: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Handphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Nama</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">QR Code</th>
                <th className="px-6 py-4 font-medium">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : asatidz?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.id_asatidz}</td>
                  <td className="px-6 py-4 text-slate-600">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {item.qr_card?.qr_code || 'Belum Ada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.units?.map((u:any) => u.name).join(', ') || '-'}
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
