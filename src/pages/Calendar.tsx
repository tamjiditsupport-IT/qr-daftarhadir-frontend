import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  running: 'bg-green-500',
  finished: 'bg-slate-400',
  draft: 'bg-yellow-500',
};

export default function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: meetings } = useQuery({
    queryKey: ['meetings-calendar', currentYear, currentMonth],
    queryFn: async () => {
      const res = await api.get('/meetings?all=true');
      return res.data.data;
    },
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getMeetingsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (meetings || []).filter((m: any) => {
      const mDate = m.start_time?.substring(0, 10);
      return mDate === dateStr;
    });
  };

  const selectedMeetings = selectedDate ? (meetings || []).filter((m: any) => m.start_time?.startsWith(selectedDate)) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <CalendarIcon size={24} />
            </div>
            Kalender Rapat
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Jadwal rapat dalam tampilan kalender interaktif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/30 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 hover:text-primary">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight">{MONTHS[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 hover:text-primary">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayMeetings = getMeetingsForDay(day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-28 border-b border-r border-slate-100 dark:border-slate-800/50 p-2 cursor-pointer transition-all duration-200 hover:bg-primary/5 dark:hover:bg-primary/10 relative group ${isSelected ? 'bg-primary/10 dark:bg-primary/20 shadow-inner' : ''}`}
                >
                  {isSelected && <div className="absolute inset-0 border-2 border-primary/50 dark:border-primary/40 rounded-sm pointer-events-none z-10"></div>}
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1.5 transition-transform group-hover:scale-110 ${isToday ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md shadow-primary/30' : 'text-slate-700 dark:text-slate-200'}`}>
                    {day}
                  </div>
                  <div className="space-y-1 relative z-20">
                    {dayMeetings.slice(0, 2).map((m: any) => (
                      <div key={m.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded-md text-white font-medium shadow-sm ${STATUS_COLORS[m.status] || 'bg-slate-400'}`}>
                        {m.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className="text-[10px] font-semibold text-primary dark:text-primary-light pl-1 hover:underline">+{dayMeetings.length - 2} lagi</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/30 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg shadow-inner">
              <CalendarIcon size={18} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal'}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 dark:text-slate-400">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                  <CalendarIcon size={24} className="text-slate-400" />
                </div>
                <p className="font-medium text-sm">Klik tanggal di kalender untuk melihat detail rapat</p>
              </div>
            ) : selectedMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 dark:text-slate-400">
                <p className="font-medium text-sm">Tidak ada rapat di tanggal ini</p>
              </div>
            ) : selectedMeetings.map((m: any) => (
              <Link key={m.id} to={`/meetings/${m.id}`} className="block px-6 py-4 hover:bg-primary/5 dark:hover:bg-slate-700/50 transition-colors group">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${STATUS_COLORS[m.status]}`}></div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-primary transition-colors">{m.title}</span>
                </div>
                <div className="ml-5.5 space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-block w-12 text-slate-400 dark:text-slate-500">Waktu:</span> 
                    {m.start_time ? new Date(m.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-block w-12 text-slate-400 dark:text-slate-500">Jenis:</span> 
                    {m.type?.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Legend */}
          <div className="px-6 py-5 border-t border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Keterangan Status</p>
            <div className="grid grid-cols-2 gap-3">
              {[['scheduled', 'Terjadwal'], ['running', 'Berlangsung'], ['finished', 'Selesai'], ['draft', 'Draft']].map(([s, l]) => (
                <div key={s} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${STATUS_COLORS[s]}`}></div>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
