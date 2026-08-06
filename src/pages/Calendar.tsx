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
      const res = await api.get('/meetings');
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
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Kalender Rapat</h2>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Jadwal rapat dalam tampilan kalender</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{MONTHS[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"></div>
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
                  className={`h-24 border-b border-r border-slate-100 dark:border-slate-800 p-1.5 cursor-pointer transition-colors hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${isToday ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayMeetings.slice(0, 2).map((m: any) => (
                      <div key={m.id} className={`text-[10px] truncate px-1 py-0.5 rounded text-white font-medium ${STATUS_COLORS[m.status] || 'bg-slate-400'}`}>
                        {m.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 pl-1">+{dayMeetings.length - 2} lagi</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal'}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {!selectedDate ? (
              <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Klik tanggal di kalender untuk melihat rapat</div>
            ) : selectedMeetings.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Tidak ada rapat di tanggal ini</div>
            ) : selectedMeetings.map((m: any) => (
              <Link key={m.id} to={`/meetings/${m.id}`} className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[m.status]}`}></div>
                  <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">{m.title}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 ml-4">{m.start_time ? new Date(m.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 ml-4">{m.type?.name}</p>
              </Link>
            ))}
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">Keterangan:</p>
            <div className="space-y-1.5">
              {[['scheduled', 'Terjadwal'], ['running', 'Berlangsung'], ['finished', 'Selesai'], ['draft', 'Draft']].map(([s, l]) => (
                <div key={s} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s]}`}></div>
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
