import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Activity, Clock, User } from 'lucide-react';

export default function AuditLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/audit-logs');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Riwayat Sistem</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Catatan seluruh aktivitas krusial admin</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">Pelaku</th>
                <th className="px-6 py-4 font-medium">Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900/50">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
                      <span>{new Date(item.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.user?.name || 'Sistem / Anonim'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Activity size={16} className="text-blue-500" />
                      <span className="text-slate-700 dark:text-slate-200">{item.action}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    Belum ada riwayat aktivitas.
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
