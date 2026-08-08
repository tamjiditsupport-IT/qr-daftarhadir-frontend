import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Settings, Save, Building, Clock, Database } from 'lucide-react';

export default function SystemSettings() {
  const [formData, setFormData] = useState({
    organization_name: '',
    late_minutes: '10',
    timezone: 'Asia/Jakarta',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        organization_name: settings.organization_name || '',
        late_minutes: settings.late_minutes?.toString() || '10',
        timezone: settings.timezone || 'Asia/Jakarta',
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings', formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <Settings size={24} />
            </div>
            Pengaturan Sistem
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Konfigurasi dasar aplikasi SIMAS</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
            <Building size={20} className="text-primary" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Informasi Umum</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama Pondok / Yayasan</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={e => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="Masukkan nama lembaga..."
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Nama ini akan muncul di header dan laporan yang dicetak</p>
            </div>
          </div>
        </div>

        {/* Attendance Settings */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
            <Clock size={20} className="text-orange-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Pengaturan Kehadiran</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Toleransi Terlambat (menit)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.late_minutes}
                onChange={e => setFormData({ ...formData, late_minutes: e.target.value })}
                className="w-48 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
                Asatidz yang scan setelah batas ini akan ditandai sebagai Terlambat. Default saat ini: <strong>{formData.late_minutes} menit</strong>.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Zona Waktu</label>
              <select
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full md:w-64 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
              >
                <option value="Asia/Jakarta">WIB — Asia/Jakarta (UTC+7)</option>
                <option value="Asia/Makassar">WITA — Asia/Makassar (UTC+8)</option>
                <option value="Asia/Jayapura">WIT — Asia/Jayapura (UTC+9)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
            <Database size={20} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Informasi Sistem</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Versi Aplikasi', val: 'SIMAS v1.0' },
              { label: 'Framework Backend', val: 'Laravel 12' },
              { label: 'Framework Frontend', val: 'React + Vite' },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">{item.label}</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          {saveSuccess && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              ✅ Pengaturan berhasil disimpan
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
