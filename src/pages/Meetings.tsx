import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function Meetings() {
  const [showForm, setShowForm] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/meetings', formData);
      setShowForm(false);
      refetch();
    } catch (err) {
      alert("Gagal membuat rapat");
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
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Rapat</h2>
          <p className="text-slate-500 mt-1">Jadwalkan rapat dan kelola sesi aktif</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Buat Rapat
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Form Buat Rapat</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Rapat</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Rapat</label>
              <select
                required
                value={formData.meeting_type_id}
                onChange={e => setFormData({...formData, meeting_type_id: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white"
              >
                {meetingTypes?.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Mulai</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Toleransi Telat (Menit)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.late_minutes}
                  onChange={e => setFormData({...formData, late_minutes: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Undang Unit Instansi</label>
              <div className="space-y-2 border border-slate-200 p-3 rounded-lg max-h-48 overflow-y-auto">
                {units?.map((u: any) => (
                  <label key={u.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.unit_ids.includes(u.id)}
                      onChange={() => toggleUnit(u.id)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                Simpan & Jadwalkan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Judul Rapat</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium">Waktu Mulai</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : meetings?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.title}</td>
                  <td className="px-6 py-4 text-slate-600">{item.type?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(item.start_time).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 capitalize">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/meetings/${item.id}`} className="text-primary hover:text-primary-dark font-medium text-sm">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
