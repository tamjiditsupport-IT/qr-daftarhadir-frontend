import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { BarChart2, Building, Users, Calendar, TrendingUp, Download, FileSpreadsheet, FileText } from 'lucide-react';

const TABS = [
  { id: 'meetings', label: 'Per Rapat', icon: Calendar },
  { id: 'units', label: 'Per Unit', icon: Building },
  { id: 'asatidz', label: 'Per Asatidz', icon: Users },
  { id: 'monthly', label: 'Bulanan', icon: BarChart2 },
  { id: 'yearly', label: 'Tahunan', icon: TrendingUp },
];

const STATUS_STYLES: Record<string, string> = {
  Present: 'bg-green-100 text-green-700',
  Late: 'bg-orange-100 text-orange-700',
  Sick: 'bg-blue-100 text-blue-700',
  Excused: 'bg-purple-100 text-purple-700',
  Absent: 'bg-red-100 text-red-700',
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('meetings');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', activeTab, year, month],
    queryFn: async () => {
      const params: any = {};
      if (activeTab === 'monthly') { params.year = year; params.month = month; }
      if (activeTab === 'yearly') { params.year = year; }
      const res = await api.get(`/reports/${activeTab}`, { params });
      return res.data.data;
    },
  });

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const params: any = { type, report: activeTab };
      if (activeTab === 'monthly') { params.year = year; params.month = month; }
      if (activeTab === 'yearly') { params.year = year; }
      const response = await api.get('/reports/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_${activeTab}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert('Gagal mengunduh laporan'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Laporan Kehadiran</h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Rekap dan analisis data kehadiran Asatidz</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('excel')} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 text-sm font-medium">
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 text-sm font-medium">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900'}`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters for time-based reports */}
      {(activeTab === 'monthly' || activeTab === 'yearly') && (
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mr-2">Tahun:</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 outline-none">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {activeTab === 'monthly' && (
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-300 mr-2">Bulan:</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 outline-none">
                {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !data || (Array.isArray(data) && data.length === 0) ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <BarChart2 size={48} className="mx-auto mb-3 opacity-20" />
            <p>Belum ada data untuk ditampilkan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {activeTab === 'meetings' && <>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Judul Rapat</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Tanggal</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Hadir</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Terlambat</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Alfa</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">%</th>
                  </>}
                  {activeTab === 'units' && <>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Unit / Instansi</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total Rapat</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total Hadir</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Rata-rata %</th>
                  </>}
                  {activeTab === 'asatidz' && <>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Nama Asatidz</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">ID</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total Rapat</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Hadir</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Alfa</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">%</th>
                  </>}
                  {(activeTab === 'monthly' || activeTab === 'yearly') && <>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Periode</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total Rapat</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total Hadir</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Total Alfa</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">% Kehadiran</th>
                  </>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.isArray(data) && data.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900/50">
                    {activeTab === 'meetings' && <>
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{row.title}</td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs">{row.date ? new Date(row.date).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-6 py-3 text-center">{row.total}</td>
                      <td className="px-6 py-3 text-center text-green-600 font-medium">{row.present}</td>
                      <td className="px-6 py-3 text-center text-orange-600 font-medium">{row.late}</td>
                      <td className="px-6 py-3 text-center text-red-600 font-medium">{row.absent}</td>
                      <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.percentage >= 80 ? 'bg-green-100 text-green-700' : row.percentage >= 60 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{row.percentage}%</span></td>
                    </>}
                    {activeTab === 'units' && <>
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{row.name}</td>
                      <td className="px-6 py-3 text-center">{row.total_meetings}</td>
                      <td className="px-6 py-3 text-center text-green-600">{row.total_present}</td>
                      <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.avg_percentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{row.avg_percentage}%</span></td>
                    </>}
                    {activeTab === 'asatidz' && <>
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{row.name}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{row.id_asatidz}</td>
                      <td className="px-6 py-3 text-center">{row.total_meetings}</td>
                      <td className="px-6 py-3 text-center text-green-600">{row.total_present}</td>
                      <td className="px-6 py-3 text-center text-red-600">{row.total_absent}</td>
                      <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.percentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{row.percentage}%</span></td>
                    </>}
                    {(activeTab === 'monthly' || activeTab === 'yearly') && <>
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{row.period}</td>
                      <td className="px-6 py-3 text-center">{row.total_meetings}</td>
                      <td className="px-6 py-3 text-center text-green-600">{row.total_present}</td>
                      <td className="px-6 py-3 text-center text-red-600">{row.total_absent}</td>
                      <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.percentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{row.percentage}%</span></td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
