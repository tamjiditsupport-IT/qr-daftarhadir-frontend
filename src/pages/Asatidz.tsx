import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Plus, Upload, Download, Edit, Trash2, FileSpreadsheet, Users } from 'lucide-react';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Pagination from '../components/Pagination';

export default function Asatidz() {
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [page, setPage] = useState(1);
  
  const { data: asatidzData, isLoading, refetch } = useQuery({
    queryKey: ['asatidz', page],
    queryFn: async () => {
      const res = await api.get(`/asatidz?page=${page}`);
      return res.data.data;
    }
  });

  const asatidz = asatidzData?.data || asatidzData || [];
  const pagination = asatidzData?.current_page ? asatidzData : null;

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

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/asatidz/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Asatidz.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Gagal mendownload template');
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <Users size={24} />
            </div>
            Data Asatidz
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manajemen data asatidz dan QR Code terpusat</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden" 
          />
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700 font-semibold shadow-sm hover:shadow-md backdrop-blur-sm"
            title="Download Template Excel"
          >
            <FileSpreadsheet size={18} className="mr-2 text-slate-400" />
            Template
          </button>
          <button 
            onClick={handleImportClick}
            className="flex items-center bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700 font-semibold shadow-sm hover:shadow-md backdrop-blur-sm"
          >
            <Upload size={18} className="mr-2 text-slate-400" />
            Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700 font-semibold shadow-sm hover:shadow-md backdrop-blur-sm"
          >
            <Download size={18} className="mr-2 text-slate-400" />
            Export
          </button>
          <button 
            onClick={handleOpenAddForm}
            className="flex items-center bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" />
            Tambah Asatidz
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 transition-all duration-300 mb-6">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-6 text-lg tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            {isEditMode ? 'Form Edit Asatidz' : 'Form Tambah Asatidz'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">ID / NIP</label>
                <input
                  type="text"
                  required
                  disabled={isEditMode}
                  value={formData.id_asatidz}
                  onChange={e => setFormData({...formData, id_asatidz: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-300 disabled:bg-slate-100/80 dark:disabled:bg-slate-900/80 disabled:text-slate-500 shadow-sm font-medium"
                  placeholder="Masukkan ID / NIP"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">No. Handphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-300 shadow-sm font-medium"
                  placeholder="Contoh: 08123456789"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-300 shadow-sm font-medium"
                placeholder="Masukkan Nama Lengkap"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Pilih Unit (Instansi)</label>
                <div className="space-y-2 border border-slate-200/80 dark:border-slate-700 p-4 rounded-2xl max-h-48 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 shadow-inner custom-scrollbar">
                  {units?.map((u: any) => (
                    <label key={u.id} className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.unit_ids.includes(u.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...formData.unit_ids, u.id]
                            : formData.unit_ids.filter(id => id !== u.id);
                          setFormData({...formData, unit_ids: newIds});
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 shadow-sm"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium select-none">{u.name}</span>
                    </label>
                  ))}
                  {(!units || units.length === 0) && <p className="text-sm text-slate-500 italic p-2">Tidak ada unit tersedia</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Pilih Jabatan</label>
                <div className="space-y-2 border border-slate-200/80 dark:border-slate-700 p-4 rounded-2xl max-h-48 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 shadow-inner custom-scrollbar">
                  {positions?.map((p: any) => (
                    <label key={p.id} className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.position_ids.includes(p.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...formData.position_ids, p.id]
                            : formData.position_ids.filter(id => id !== p.id);
                          setFormData({...formData, position_ids: newIds});
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 shadow-sm"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium select-none">{p.name}</span>
                    </label>
                  ))}
                  {(!positions || positions.length === 0) && <p className="text-sm text-slate-500 italic p-2">Tidak ada jabatan tersedia</p>}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800/50 mt-6">
              <button type="submit" className="bg-gradient-to-r from-primary to-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:from-primary-dark hover:to-indigo-700 transition-all duration-300 shadow-md shadow-primary/30 hover:shadow-lg hover:-translate-y-0.5">
                Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/30 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">ID</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Nama</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Phone</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">QR Code</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Unit</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">Memuat data...</td></tr>
              ) : asatidz?.map((item: any) => (
                <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{item.id_asatidz}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{item.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{item.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-sm inline-block">
                      {item.qr_card?.qr_code || 'Belum Ada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                    {item.units?.map((u:any) => u.name).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {item.qr_card?.qr_code && (
                        <button 
                          onClick={() => setPrintData(item)}
                          className="px-3 py-1.5 text-xs font-bold text-primary hover:text-white border border-primary hover:bg-primary rounded-lg transition-all shadow-sm mr-1"
                          title="Cetak QR"
                        >
                          Cetak
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenEditForm(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow"
                        title="Edit Data"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow"
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
        {pagination && (
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from || 0}
            to={pagination.to || 0}
            onPageChange={setPage}
          />
        )}
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
