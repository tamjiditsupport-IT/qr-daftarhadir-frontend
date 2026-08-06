import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useState } from 'react';
import { Layers, Briefcase, Plus, Trash2, Edit2, ChevronRight, ChevronDown, Folder, FolderOpen, Network, Database } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

export default function MasterData() {
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [showMeetingTypeForm, setShowMeetingTypeForm] = useState(false);

  const [unitData, setUnitData] = useState({ id: null as number | null, name: '', parent_id: '' });
  const [positionData, setPositionData] = useState({ id: null as number | null, name: '' });
  const [meetingTypeData, setMeetingTypeData] = useState({ id: null as number | null, name: '' });
  const [isCreatingParent, setIsCreatingParent] = useState(false);

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

  const { data: meetingTypes, isLoading: isMeetingTypesLoading, refetch: refetchMeetingTypes } = useQuery({
    queryKey: ['meetingTypes'],
    queryFn: async () => {
      const res = await api.get('/meeting-types');
      return res.data.data;
    }
  });

  const flattenUnits = (units: any[], allUnits: any[], level = 0): {id: number, name: string, level: number}[] => {
    let result: any[] = [];
    units?.forEach(u => {
      result.push({ id: u.id, name: u.name, level });
      const children = allUnits.filter(c => c.parent_id === u.id);
      if (children.length > 0) {
        result = result.concat(flattenUnits(children, allUnits, level + 1));
      }
    });
    return result;
  };

  const rootUnits = units?.filter((u: any) => !u.parent_id) || [];
  const flattenedUnits = flattenUnits(rootUnits, units || []);

  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (unitData.id) {
        await api.put(`/units/${unitData.id}`, {
          name: unitData.name,
          parent_id: unitData.parent_id ? Number(unitData.parent_id) : null
        });
      } else {
        await api.post('/units', {
          name: unitData.name,
          parent_id: unitData.parent_id ? Number(unitData.parent_id) : null
        });
      }
      setUnitData({ id: null, name: '', parent_id: '' });
      setShowUnitForm(false);
      refetchUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan Unit');
    }
  };

  const handleUnitDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus unit ini?')) return;
    try {
      await api.delete(`/units/${id}`);
      refetchUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus unit');
    }
  };

  const handleEditUnit = (unit: any) => {
    setUnitData({ id: unit.id, name: unit.name, parent_id: unit.parent_id || '' });
    setShowUnitForm(true);
  };

  const handleAddChild = (parentId: number) => {
    setUnitData({ id: null, name: '', parent_id: parentId.toString() });
    setShowUnitForm(true);
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (positionData.id) {
        await api.put(`/positions/${positionData.id}`, { name: positionData.name });
      } else {
        await api.post('/positions', { name: positionData.name });
      }
      setPositionData({ id: null, name: '' });
      setShowPositionForm(false);
      refetchPositions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan Jabatan');
    }
  };

  const handlePositionDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus jabatan ini?')) return;
    try {
      await api.delete(`/positions/${id}`);
      refetchPositions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus jabatan');
    }
  };

  const handleEditPosition = (position: any) => {
    setPositionData({ id: position.id, name: position.name });
    setShowPositionForm(true);
  };

  const handleMeetingTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (meetingTypeData.id) {
        await api.put(`/meeting-types/${meetingTypeData.id}`, { name: meetingTypeData.name });
      } else {
        await api.post('/meeting-types', { name: meetingTypeData.name });
      }
      setMeetingTypeData({ id: null, name: '' });
      setShowMeetingTypeForm(false);
      refetchMeetingTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan Tipe Rapat');
    }
  };

  const handleMeetingTypeDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus tipe rapat ini?')) return;
    try {
      await api.delete(`/meeting-types/${id}`);
      refetchMeetingTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus tipe rapat');
    }
  };

  const handleEditMeetingType = (type: any) => {
    setMeetingTypeData({ id: type.id, name: type.name });
    setShowMeetingTypeForm(true);
  };

  const handleCreateParent = async (inputValue: string) => {
    setIsCreatingParent(true);
    try {
      const res = await api.post('/units', { name: inputValue, parent_id: null });
      const newUnit = res.data.data;
      setUnitData({ ...unitData, parent_id: newUnit.id.toString() });
      await refetchUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan Induk');
    } finally {
      setIsCreatingParent(false);
    }
  };

  const parentOptions = [
    { value: '', label: '-- Tidak Ada Induk --' },
    ...flattenedUnits.map(u => ({
      value: u.id.toString(),
      label: `${'\u00A0'.repeat(u.level * 4)}${u.level > 0 ? '└ ' : ''}${u.name}`
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <Database size={24} />
            </div>
            Master Data
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Kelola data Unit, Jabatan, dan Tipe Rapat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Unit */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center">
              <Layers className="text-blue-500 mr-2.5" size={20} />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Unit / Instansi</h3>
            </div>
            <button 
              onClick={() => {
                setUnitData({ id: null, name: '', parent_id: '' });
                setShowUnitForm(!showUnitForm);
              }}
              className="text-white font-bold text-sm flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus size={16} className="mr-1.5" /> Tambah Root Unit
            </button>
          </div>

          {showUnitForm && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-blue-50/30">
              <form onSubmit={handleUnitSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama Unit</label>
                  <input
                    type="text"
                    required
                    value={unitData.name}
                    onChange={e => setUnitData({...unitData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Induk Unit (Parent)</label>
                  <CreatableSelect
                    isClearable
                    isDisabled={isCreatingParent}
                    isLoading={isCreatingParent}
                    onChange={(newValue: any) => setUnitData({...unitData, parent_id: newValue ? newValue.value : ''})}
                    onCreateOption={handleCreateParent}
                    options={parentOptions}
                    value={parentOptions.find(o => o.value === unitData.parent_id) || parentOptions[0]}
                    formatOptionLabel={data => <span style={{ whiteSpace: 'pre' }}>{data.label}</span>}
                    placeholder="Pilih atau ketik untuk buat baru..."
                    className="text-sm"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium flex-1">
                    Simpan Unit
                  </button>
                  <button type="button" onClick={() => setShowUnitForm(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm font-medium flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-96 p-4">
            {isUnitsLoading ? (
              <div className="text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 py-4">Loading...</div>
            ) : (
              <UnitTree 
                units={units?.filter((u: any) => !u.parent_id)} 
                allUnits={units} 
                onEdit={handleEditUnit}
                onDelete={handleUnitDelete}
                onAddChild={handleAddChild}
              />
            )}
          </div>
        </div>

        {/* Panel Jabatan */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center">
              <Briefcase className="text-emerald-500 mr-2.5" size={20} />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Jabatan (Position)</h3>
            </div>
            <button 
              onClick={() => {
                setPositionData({ id: null, name: '' });
                setShowPositionForm(!showPositionForm);
              }}
              className="text-white font-bold text-sm flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus size={16} className="mr-1.5" /> Tambah
            </button>
          </div>

          {showPositionForm && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/30">
              <form onSubmit={handlePositionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama Jabatan</label>
                  <input
                    type="text"
                    required
                    value={positionData.name}
                    onChange={e => setPositionData({...positionData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium flex-1">
                    Simpan Jabatan
                  </button>
                  <button type="button" onClick={() => setShowPositionForm(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm font-medium flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-white dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Jabatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isPositionsLoading ? (
                  <tr><td colSpan={2} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Loading...</td></tr>
                ) : positions?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{p.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditPosition(p)} 
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors" 
                          title="Edit Jabatan"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handlePositionDelete(p.id)} 
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors" 
                          title="Hapus Jabatan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Tipe Rapat */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center">
              <Layers className="text-purple-500 mr-2.5" size={20} />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Tipe Rapat</h3>
            </div>
            <button 
              onClick={() => {
                setMeetingTypeData({ id: null, name: '' });
                setShowMeetingTypeForm(!showMeetingTypeForm);
              }}
              className="text-white font-bold text-sm flex items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus size={16} className="mr-1.5" /> Tambah
            </button>
          </div>

          {showMeetingTypeForm && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-purple-50/30">
              <form onSubmit={handleMeetingTypeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama Tipe Rapat</label>
                  <input
                    type="text"
                    required
                    value={meetingTypeData.name}
                    onChange={e => setMeetingTypeData({...meetingTypeData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium flex-1">
                    Simpan Tipe
                  </button>
                  <button type="button" onClick={() => setShowMeetingTypeForm(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm font-medium flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-white dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Tipe Rapat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isMeetingTypesLoading ? (
                  <tr><td colSpan={2} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Loading...</td></tr>
                ) : meetingTypes?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">{t.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditMeetingType(t)} 
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors" 
                          title="Edit Tipe"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleMeetingTypeDelete(t.id)} 
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors" 
                          title="Hapus Tipe"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
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

const UnitTreeNode = ({
  unit,
  allUnits,
  level,
  onEdit,
  onDelete,
  onAddChild
}: {
  unit: any,
  allUnits: any[],
  level: number,
  onEdit: (unit: any) => void,
  onDelete: (id: number) => void,
  onAddChild: (parentId: number) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = allUnits?.filter((u: any) => u.parent_id === unit.id) || [];
  const hasChildren = children.length > 0;

  return (
    <div className="text-sm">
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50 ${level === 0 ? 'bg-slate-50/50 dark:bg-slate-900/40 font-bold text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 font-medium'}`}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div 
          className="flex items-center flex-1 cursor-pointer" 
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          <span className="w-5 flex justify-center mr-1 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
            {hasChildren ? (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            )}
          </span>
          <span className="mr-2 text-primary/70">
            {hasChildren ? (
              isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
            ) : (
              <Network size={14} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
            )}
          </span>
          <span className="select-none">{unit.name}</span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAddChild(unit.id)} title="Tambah Sub-Unit" className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors">
            <Plus size={14} />
          </button>
          <button onClick={() => onEdit(unit)} title="Edit" className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(unit.id)} title="Hapus" className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {/* Animated collapse container could be used here, but simple conditional rendering works for now */}
      {hasChildren && isExpanded && (
        <div className="mt-1 relative before:absolute before:inset-y-0 before:left-4 before:-ml-px before:w-0.5 before:bg-slate-100 dark:bg-slate-800">
          <UnitTree 
            units={children} 
            allUnits={allUnits} 
            level={level + 1} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onAddChild={onAddChild} 
          />
        </div>
      )}
    </div>
  );
};

const UnitTree = ({ 
  units, 
  allUnits, 
  level = 0,
  onEdit,
  onDelete,
  onAddChild
}: { 
  units: any[], 
  allUnits: any[], 
  level?: number,
  onEdit: (unit: any) => void,
  onDelete: (id: number) => void,
  onAddChild: (parentId: number) => void
}) => {
  if (!units || units.length === 0) return null;
  
  return (
    <div className="space-y-1.5 relative">
      {units.map((unit) => (
        <UnitTreeNode 
          key={unit.id}
          unit={unit}
          allUnits={allUnits}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
