import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function Asatidz() {
  const [showForm, setShowForm] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  
  const { data: asatidz, isLoading, refetch } = useQuery({
    queryKey: ['asatidz'],
    queryFn: async () => {
      const res = await api.get('/asatidz');
      return res.data.data;
    }
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data;
    }
  });

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await api.get('/positions');
      return res.data.data;
    }
  });

  const [formData, setFormData] = useState({
    id_asatidz: '',
    name: '',
    phone: '',
    unit_ids: [] as number[],
    position_ids: [] as number[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/asatidz', formData);
      setFormData({ id_asatidz: '', name: '', phone: '', unit_ids: [], position_ids: [] });
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Unit (Instansi)</label>
                <div className="space-y-2 border border-slate-200 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {units?.map((u: any) => (
                    <label key={u.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={formData.unit_ids.includes(u.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...formData.unit_ids, u.id]
                            : formData.unit_ids.filter(id => id !== u.id);
                          setFormData({...formData, unit_ids: newIds});
                        }}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Jabatan</label>
                <div className="space-y-2 border border-slate-200 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {positions?.map((p: any) => (
                    <label key={p.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={formData.position_ids.includes(p.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...formData.position_ids, p.id]
                            : formData.position_ids.filter(id => id !== p.id);
                          setFormData({...formData, position_ids: newIds});
                        }}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
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
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
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
                  <td className="px-6 py-4 text-right">
                    {item.qr_card?.qr_code && (
                      <button 
                        onClick={() => setPrintData(item)}
                        className="text-primary hover:text-primary-dark font-medium text-sm"
                      >
                        Cetak QR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {printData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Cetak ID Card</h3>
              <button onClick={() => setPrintData(null)} className="text-slate-500 hover:text-red-500">
                Tutup
              </button>
            </div>
            
            {/* The printable area */}
            <div id="printable-id-card" className="p-8 flex flex-col items-center justify-center bg-white">
              <div className="w-[250px] h-[400px] border-2 border-slate-200 rounded-2xl flex flex-col items-center overflow-hidden shadow-sm relative bg-gradient-to-b from-blue-50 to-white">
                <div className="bg-primary w-full py-4 text-center">
                  <h2 className="text-white font-bold text-lg leading-tight">Pondok Pesantren<br/>Tamjidullah</h2>
                </div>
                
                <div className="mt-8 mb-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                  <QRCodeCanvas 
                    value={printData.qr_card.qr_code} 
                    size={140}
                    level="H"
                  />
                </div>
                
                <div className="text-center px-4 mt-2">
                  <h3 className="font-bold text-slate-800 text-lg">{printData.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">{printData.id_asatidz}</p>
                </div>
                
                <div className="absolute bottom-0 w-full bg-slate-800 text-white text-xs text-center py-2">
                  ID: {printData.qr_card.qr_code}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark"
              >
                Cetak (Print)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
