import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useState } from 'react';
import { Layers, Briefcase, Plus } from 'lucide-react';

export default function MasterData() {
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);

  const [unitData, setUnitData] = useState({ name: '', parent_id: '' });
  const [positionData, setPositionData] = useState({ name: '' });

  const { data: units, isLoading: isUnitsLoading, refetch: refetchUnits } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data;
    }
  });

  const { data: positions, isLoading: isPositionsLoading, refetch: refetchPositions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await api.get('/positions');
      return res.data.data;
    }
  });

  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/units', {
        name: unitData.name,
        parent_id: unitData.parent_id ? Number(unitData.parent_id) : null
      });
      setUnitData({ name: '', parent_id: '' });
      setShowUnitForm(false);
      refetchUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan Unit');
    }
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/positions', positionData);
      setPositionData({ name: '' });
      setShowPositionForm(false);
      refetchPositions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan Jabatan');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Master Data</h2>
        <p className="text-slate-500 mt-1">Kelola data Unit (Instansi) dan Jabatan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Unit */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center">
              <Layers className="text-primary mr-2" size={20} />
              <h3 className="font-semibold text-slate-800">Unit / Instansi</h3>
            </div>
            <button 
              onClick={() => setShowUnitForm(!showUnitForm)}
              className="text-primary hover:text-primary-dark font-medium text-sm flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} className="mr-1" /> Tambah
            </button>
          </div>

          {showUnitForm && (
            <div className="p-6 border-b border-slate-200 bg-blue-50/30">
              <form onSubmit={handleUnitSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Unit</label>
                  <input
                    type="text"
                    required
                    value={unitData.name}
                    onChange={e => setUnitData({...unitData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Induk Unit (Parent)</label>
                  <select
                    value={unitData.parent_id}
                    onChange={e => setUnitData({...unitData, parent_id: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white"
                  >
                    <option value="">-- Tidak Ada Induk --</option>
                    {units?.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium flex-1">
                    Simpan Unit
                  </button>
                  <button type="button" onClick={() => setShowUnitForm(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm font-medium flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-white sticky top-0 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Unit</th>
                  <th className="px-6 py-3 font-medium">Induk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isUnitsLoading ? (
                  <tr><td colSpan={2} className="px-6 py-4 text-center text-slate-500">Loading...</td></tr>
                ) : units?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {u.parent_id ? units.find((p:any) => p.id === u.parent_id)?.name || `ID: ${u.parent_id}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Jabatan */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center">
              <Briefcase className="text-emerald-600 mr-2" size={20} />
              <h3 className="font-semibold text-slate-800">Jabatan (Position)</h3>
            </div>
            <button 
              onClick={() => setShowPositionForm(!showPositionForm)}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} className="mr-1" /> Tambah
            </button>
          </div>

          {showPositionForm && (
            <div className="p-6 border-b border-slate-200 bg-emerald-50/30">
              <form onSubmit={handlePositionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Jabatan</label>
                  <input
                    type="text"
                    required
                    value={positionData.name}
                    onChange={e => setPositionData({...positionData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium flex-1">
                    Simpan Jabatan
                  </button>
                  <button type="button" onClick={() => setShowPositionForm(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm font-medium flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-white sticky top-0 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Jabatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isPositionsLoading ? (
                  <tr><td className="px-6 py-4 text-center text-slate-500">Loading...</td></tr>
                ) : positions?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
