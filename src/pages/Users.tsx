import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useState } from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';

export default function Users() {
  const [showForm, setShowForm] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan User</h2>
          <p className="text-slate-500 mt-1">Manajemen akun dan hak akses</p>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Form Tambah User</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role (Hak Akses)</label>
              <select
                required
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="">-- Pilih Role --</option>
                {roles?.map((r: any) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            
            {formData.role === 'admin_instansi' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit / Instansi</label>
                <select
                  required
                  value={formData.unit_id}
                  onChange={e => setFormData({...formData, unit_id: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="">-- Pilih Unit --</option>
                  {units?.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Admin Instansi hanya dapat mengelola rapat di unit ini.</p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                Simpan
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
                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Unit / Scope</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : users?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center">
                    <Shield className="text-slate-400 mr-2 w-4 h-4" />
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.email}</td>
                  <td className="px-6 py-4">
                    {item.roles?.map((r: any) => (
                      <span key={r.id} className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
                        {r.name}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.unit ? (
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200 text-slate-700">
                        {item.unit.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">All Scope</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
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
