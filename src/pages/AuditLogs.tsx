import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Activity, Clock, User } from 'lucide-react';
import { useState } from 'react';
import Pagination from '../components/Pagination';

export default function AuditLogs() {
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const res = await api.get(`/audit-logs?page=${page}`);
      return res.data.data;
    }
  });

  const logs = logsData?.data || logsData || [];
  const pagination = logsData?.current_page ? logsData : null;

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <Activity size={24} />
            </div>
            Riwayat Sistem
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Catatan seluruh aktivitas krusial admin</p>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Waktu</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Pelaku</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs?.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Belum ada riwayat aktivitas</td></tr>
              ) : (
                logs?.map((item: any) => (
                <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                      <span>{new Date(item.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-primary/50 group-hover:text-primary transition-colors" />
                      <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{item.user?.name || 'Sistem / Anonim'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Activity size={16} className="text-blue-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{item.action}</span>
                    </div>
                  </td>
                </tr>
              )))}
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
    </div>
  );
}
