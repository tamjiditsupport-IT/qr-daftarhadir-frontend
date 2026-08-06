import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Plus, Check, ChevronRight, X, Clock, Users, Building, Info, FileText } from 'lucide-react';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  running: 'bg-green-100 text-green-700',
  finished: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
  draft: 'bg-yellow-100 text-yellow-700',
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
  
  const { data: meetings, isLoading, refetch } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const res = await api.get('/meetings');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen Rapat</h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Jadwalkan rapat dan kelola sesi aktif</p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Buat Rapat
        </button>
      </div>

      {/* Rapat Aktif / Terjadwal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Judul Rapat</th>
                <th className="px-6 py-4 font-semibold">Tipe</th>
                <th className="px-6 py-4 font-semibold">Waktu Mulai</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Memuat data...</td></tr>
              ) : meetings?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Belum ada rapat</td></tr>
              ) : (
                meetings?.map((meeting: any) => (
                  <tr key={meeting.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{meeting.title}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{meeting.meeting_code}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
                        <Users size={14} />
                        {meeting.participants?.length || 0} peserta diundang
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {meeting.type?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {new Date(meeting.start_time).toLocaleString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[meeting.status] || 'bg-slate-100 dark:bg-slate-800'}`}>
                        {STATUS_LABELS[meeting.status] || meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/meetings/${meeting.id}`}
                        className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                      >
                        Detail <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Waktu Mulai <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.start_time}
                        onChange={e => setFormData({...formData, start_time: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Toleransi Terlambat (menit)</label>
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
