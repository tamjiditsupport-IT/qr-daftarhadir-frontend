import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useState } from 'react';
import { Shield, Plus, Trash2, KeyRound } from 'lucide-react';
import Select from 'react-select';

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    unit_id: ''
  });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    }
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/roles');
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

  const unitOptions = flattenedUnits.map(u => ({
    value: u.id.toString(),
    label: `${'\u00A0'.repeat(u.level * 4)}${u.level > 0 ? '└ ' : ''}${u.name}`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...formData,
        unit_id: formData.role === 'admin_instansi' && formData.unit_id ? Number(formData.unit_id) : null
      });
      setFormData({ name: '', email: '', password: '', role: '', unit_id: '' });
      setShowForm(false);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    try {
      await api.post(`/users/${resetTarget.id}/reset-password`, { password: newPassword });
      setResetTarget(null);
      setNewPassword('');
      alert('Password berhasil direset!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mereset password');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pengaturan User</h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manajemen akun dan hak akses</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tambah User
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Form Tambah User</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Role (Hak Akses)</label>
              <select
                required
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
              >
                <option value="">-- Pilih Role --</option>
                {roles?.map((r: any) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            
            {formData.role === 'admin_instansi' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Unit / Instansi</label>
                <Select
                  isClearable
                  options={unitOptions}
                  value={unitOptions.find(o => o.value === formData.unit_id) || null}
                  onChange={(newValue: any) => setFormData({...formData, unit_id: newValue ? newValue.value : ''})}
                  formatOptionLabel={data => <span style={{ whiteSpace: 'pre' }}>{data.label}</span>}
                  placeholder="Cari atau pilih instansi..."
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#cbd5e1',
                      borderRadius: '0.5rem',
                      padding: '0.125rem'
                    })
                  }}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Admin Instansi hanya dapat mengelola rapat di unit ini.</p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Unit / Scope</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : users?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900/50">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100 flex items-center">
                    <Shield className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mr-2 w-4 h-4" />
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.email}</td>
                  <td className="px-6 py-4">
                    {item.roles?.map((r: any) => (
                      <span key={r.id} className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
                        {r.name}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {item.unit ? (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                        {item.unit.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 italic text-xs">All Scope</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setResetTarget({ id: item.id, name: item.name }); setNewPassword(''); }}
                        className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Reset Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">{resetTarget.name}</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 font-medium">Reset</button>
                <button type="button" onClick={() => setResetTarget(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
