import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Plus, Check, X, Clock, Users, Building, Info, FileText, CalendarDays, Upload, FileSpreadsheet } from 'lucide-react';
import { useState, useRef } from 'react';
import Pagination from '../components/Pagination';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/airbnb.css';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
  running: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
  finished: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50',
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Terjadwal',
  running: 'Berlangsung',
  finished: 'Selesai',
  draft: 'Draft',
};

export default function Meetings() {
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  
  const { data: meetingsData, isLoading, refetch } = useQuery({
    queryKey: ['meetings', page],
    queryFn: async () => {
      const res = await api.get(`/meetings?page=${page}`);
      return res.data.data;
    }
  });

  const meetings = meetingsData?.data || meetingsData || [];
  const pagination = meetingsData?.current_page ? meetingsData : null;

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data;
    }
  });

  const { data: meetingTypes } = useQuery({
    queryKey: ['meetingTypes'],
    queryFn: async () => {
      const res = await api.get('/meeting-types');
      return res.data.data;
    }
  });

  const [formData, setFormData] = useState({
    title: '',
    meeting_type_id: 1, 
    start_time: '',
    late_minutes: 15,
    unit_ids: [] as number[]
  });

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/meetings', formData);
      setShowWizard(false);
      setStep(1);
      setFormData({
        title: '',
        meeting_type_id: 1, 
        start_time: '',
        late_minutes: 15,
        unit_ids: []
      });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat rapat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUnit = (id: number) => {
    setFormData(prev => ({
      ...prev,
      unit_ids: prev.unit_ids.includes(id) 
        ? prev.unit_ids.filter(u => u !== id)
        : [...prev.unit_ids, id]
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      await api.post('/meetings/import-excel', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Import berhasil!');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengimpor file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/meetings/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Meetings.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Gagal mendownload template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <CalendarDays size={24} />
            </div>
            Manajemen Rapat
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Jadwalkan rapat dan kelola sesi aktif secara real-time</p>
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
            onClick={() => setShowWizard(true)}
            className="flex items-center justify-center bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" />
            Buat Rapat
          </button>
        </div>
      </div>

      {/* Rapat Aktif / Terjadwal */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Judul Rapat</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Tipe</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Waktu Mulai</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Memuat data...</td></tr>
              ) : meetings?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Belum ada rapat</td></tr>
              ) : (
                meetings?.map((meeting: any) => (
                  <tr key={meeting.id} className="hover:bg-primary/5 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{meeting.title}</div>
                      <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono mt-1">{meeting.meeting_code}</div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 w-fit px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700 shadow-sm">
                        <Users size={12} className="text-primary" />
                        {meeting.participants?.length || 0} peserta
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      {meeting.type?.name || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        {new Date(meeting.start_time).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${STATUS_COLORS[meeting.status] || 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                        {STATUS_LABELS[meeting.status] || meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/meetings/${meeting.id}`}
                        className="inline-flex items-center text-primary font-bold hover:text-white border border-primary hover:bg-primary px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Wizard Pembuatan Rapat</h3>
              <button onClick={() => setShowWizard(false)} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              {[
                { num: 1, label: 'Informasi Dasar', icon: Info },
                { num: 2, label: 'Pilih Peserta', icon: Users },
                { num: 3, label: 'Ringkasan', icon: FileText }
              ].map((s, i) => (
                <div key={s.num} className="flex flex-col items-center relative z-10 w-1/3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                    step > s.num ? 'bg-green-500 text-white' : 
                    step === s.num ? 'bg-primary text-white ring-4 ring-primary/20' : 
                    'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500'
                  }`}>
                    {step > s.num ? <Check size={20} /> : <s.icon size={20} />}
                  </div>
                  <span className={`text-xs font-semibold ${step >= s.num ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}>{s.label}</span>
                  {/* Line */}
                  {i < 2 && (
                    <div className={`absolute top-5 left-1/2 w-full h-1 -z-10 ${step > s.num ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 1 && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Judul Rapat <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Contoh: Rapat Mingguan Pengurus"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tipe Rapat <span className="text-red-500">*</span></label>
                    <select
                      value={formData.meeting_type_id}
                      onChange={e => setFormData({...formData, meeting_type_id: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
                    >
                      {meetingTypes?.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tanggal <span className="text-red-500">*</span></label>
                      <Flatpickr
                        value={formData.start_time ? formData.start_time.split('T')[0] : ''}
                        onChange={([date]) => {
                           if(date) {
                             const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                             const currentTime = formData.start_time ? (formData.start_time.split('T')[1]?.slice(0, 5) || '08:00') : '08:00';
                             setFormData({...formData, start_time: `${localDate}T${currentTime}`});
                           }
                        }}
                        options={{ dateFormat: "Y-m-d" }}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
                        placeholder="Pilih Tanggal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Jam <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        required
                        value={formData.start_time ? (formData.start_time.split('T')[1]?.slice(0, 5) || '') : ''}
                        onChange={e => {
                          const newTime = e.target.value;
                          const datePart = formData.start_time ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0];
                          setFormData({...formData, start_time: `${datePart}T${newTime}`});
                        }}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Toleransi (menit)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.late_minutes}
                        onChange={e => setFormData({...formData, late_minutes: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Pilih unit/instansi mana saja yang wajib hadir dalam rapat ini. Semua asatidz yang tergabung dalam unit yang dipilih akan masuk ke daftar peserta.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                    {units?.map((u: any) => (
                      <div 
                        key={u.id}
                        onClick={() => toggleUnit(u.id)}
                        className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.unit_ids.includes(u.id) 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${
                          formData.unit_ids.includes(u.id) ? 'bg-primary text-white' : 'border border-slate-300 dark:border-slate-600'
                        }`}>
                          {formData.unit_ids.includes(u.id) && <Check size={14} />}
                        </div>
                        <Building size={18} className={`mr-2 ${formData.unit_ids.includes(u.id) ? 'text-primary' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500'}`} />
                        <span className={`text-sm font-medium ${formData.unit_ids.includes(u.id) ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{u.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Ringkasan Rapat</h4>
                  
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Judul Rapat</span>
                    <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-100">{formData.title || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Tipe</span>
                    <span className="col-span-2 font-medium text-slate-800 dark:text-slate-100">{meetingTypes?.find((t: any) => t.id === formData.meeting_type_id)?.name}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Waktu Mulai</span>
                    <span className="col-span-2 font-medium text-slate-800 dark:text-slate-100">{formData.start_time ? new Date(formData.start_time).toLocaleString('id-ID') : '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Toleransi</span>
                    <span className="col-span-2 font-medium text-slate-800 dark:text-slate-100">{formData.late_minutes} menit</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm border-t border-slate-200 dark:border-slate-700 pt-4">
                    <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Peserta (Unit)</span>
                    <span className="col-span-2 font-medium text-slate-800 dark:text-slate-100">
                      {formData.unit_ids.length === 0 ? <span className="text-red-500 italic">Belum ada unit yang dipilih</span> : (
                        <ul className="list-disc pl-4 space-y-1">
                          {formData.unit_ids.map(id => (
                            <li key={id}>{units?.find((u: any) => u.id === id)?.name}</li>
                          ))}
                        </ul>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-slate-50 dark:bg-slate-900 rounded-b-xl">
              {step > 1 ? (
                <button onClick={handlePrev} className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                  Sebelumnya
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button 
                  onClick={handleNext}
                  disabled={step === 1 && (!formData.title || !formData.start_time)}
                  className="px-6 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title || !formData.start_time}
                  className="px-6 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Buat Rapat'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
