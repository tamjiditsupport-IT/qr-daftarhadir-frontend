import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Plus, Upload, Download, Edit, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function Asatidz() {
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ id_asatidz: '', name: '', phone: '', unit_ids: [], position_ids: [] });
    setShowForm(true);
  };

  const handleOpenEditForm = (item: any) => {
    setIsEditMode(true);
    setEditId(item.id);
    setFormData({
      id_asatidz: item.id_asatidz,
      name: item.name,
      phone: item.phone || '',
      unit_ids: item.units?.map((u: any) => u.id) || [],
      position_ids: item.positions?.map((p: any) => p.id) || []
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editId) {
        await api.put(`/asatidz/${editId}`, formData);
      } else {
        await api.post('/asatidz', formData);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      try {
        await api.delete(`/asatidz/${id}`);
        refetch();
      } catch (err) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      await api.post('/import-excel', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Import berhasil!');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengimpor file');
    }
    // reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Data_Asatidz.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Gagal mengekspor data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Data Asatidz</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manajemen data ustadz dan QR Code</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 font-medium"
          >
            <Upload size={18} className="mr-2" />
            Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 font-medium"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
          <button 
            onClick={handleOpenAddForm}
            className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Tambah Asatidz
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
            {isEditMode ? 'Form Edit Asatidz' : 'Form Tambah Asatidz'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">ID / NIP</label>
              <input
                type="text"
                required
                disabled={isEditMode}
                value={formData.id_asatidz}
                onChange={e => setFormData({...formData, id_asatidz: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">No. Handphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Pilih Unit (Instansi)</label>
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 p-3 rounded-lg max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                  {units?.map((u: any) => (
                    <label key={u.id} className="flex items-center space-x-2 cursor-pointer">
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
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Pilih Jabatan</label>
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 p-3 rounded-lg max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                  {positions?.map((p: any) => (
                    <label key={p.id} className="flex items-center space-x-2 cursor-pointer">
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
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="submit" className="bg-primary text-white font-medium px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
                Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-5 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">QR Code</th>
                <th className="px-6 py-4 font-semibold">Unit</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">Memuat data...</td></tr>
              ) : asatidz?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{item.id_asatidz}</td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.qr_card?.qr_code || 'Belum Ada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {item.units?.map((u:any) => u.name).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {item.qr_card?.qr_code && (
                        <button 
                          onClick={() => setPrintData(item)}
                          className="text-primary hover:text-primary-dark dark:text-primary dark:hover:text-blue-400 font-semibold text-sm transition-colors mr-2"
                          title="Cetak QR"
                        >
                          Cetak QR
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenEditForm(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Edit Data"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {printData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Cetak ID Card</h3>
              <button onClick={() => setPrintData(null)} className="text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                Tutup
              </button>
            </div>
            
            {/* The printable area */}
            <div id="printable-id-card" className="p-8 flex flex-col items-center justify-center bg-white dark:bg-slate-800">
              <div className="w-[250px] h-[400px] border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center overflow-hidden shadow-lg relative bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="bg-gradient-to-r from-primary-dark to-primary w-full py-5 text-center">
                  <h2 className="text-white font-extrabold text-lg leading-tight tracking-wide drop-shadow-sm">Pondok Pesantren<br/>Tamjidullah</h2>
                </div>
                
                <div className="mt-8 mb-4 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-md border border-slate-100 dark:border-slate-700/50">
                  <QRCodeCanvas 
                    value={printData.qr_card.qr_code} 
                    size={140}
                    level="H"
                  />
                </div>
                
                <div className="text-center px-4 mt-2">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xl tracking-tight">{printData.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full inline-block">{printData.id_asatidz}</p>
                </div>
                
                <div className="absolute bottom-0 w-full bg-slate-800 text-slate-300 text-xs font-medium text-center py-2.5 tracking-wider">
                  ID: {printData.qr_card.qr_code}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <button 
                onClick={() => { window.print(); }}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
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
