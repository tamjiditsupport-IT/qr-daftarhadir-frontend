import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Shield, Save, CheckSquare, Square, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleName, setRoleName] = useState('');

  const { data: roles, refetch: refetchRoles } = useQuery({
    queryKey: ['roles-permissions'],
    queryFn: async () => {
      const res = await api.get('/roles');
      return res.data.data;
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await api.get('/permissions');
      return res.data.data;
    },
  });

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p: any) => p.name) || []);
    setShowRoleForm(false);
  };

  const togglePermission = (permName: string) => {
    if (selectedPermissions.includes(permName)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permName));
    } else {
      setSelectedPermissions([...selectedPermissions, permName]);
    }
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await api.put(`/roles/${selectedRole.id}`, { permissions: selectedPermissions });
      alert('Hak akses berhasil disimpan');
      refetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan hak akses');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleName('');
    setShowRoleForm(true);
    setSelectedRole(null);
  };

  const handleEditRole = () => {
    setEditingRole(selectedRole);
    setRoleName(selectedRole.name);
    setShowRoleForm(true);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    if (selectedRole.name === 'super_admin') {
      alert('Role super_admin tidak dapat dihapus');
      return;
    }
    if (!window.confirm(`Hapus role ${selectedRole.name}?`)) return;
    try {
      await api.delete(`/roles/${selectedRole.id}`);
      alert('Role berhasil dihapus');
      setSelectedRole(null);
      refetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus role');
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setIsSaving(true);
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, { name: roleName });
        alert('Role berhasil diperbarui');
        setSelectedRole({ ...editingRole, name: roleName });
      } else {
        await api.post('/roles', { name: roleName });
        alert('Role berhasil ditambahkan');
      }
      setShowRoleForm(false);
      setEditingRole(null);
      refetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan role');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 dark:from-primary/30 dark:to-indigo-500/30 text-primary dark:text-primary-light rounded-xl shadow-inner">
              <Shield size={24} />
            </div>
            Role & Permission
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Atur hak akses untuk masing-masing peran (role)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center">
              <Shield className="text-primary mr-2.5" size={20} />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Daftar Role</h3>
            </div>
            <button onClick={handleAddRole} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors" title="Tambah Role">
              <Plus size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {roles?.map((r: any) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900 ${selectedRole?.id === r.id ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-slate-700 dark:text-slate-200 border-l-4 border-transparent'}`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-700 overflow-hidden">
          {showRoleForm ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
                </h3>
                <button onClick={() => setShowRoleForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveRole} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Role</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-primary focus:border-primary px-4 py-2"
                    placeholder="Contoh: admin_asrama"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowRoleForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Batal</button>
                  <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/30 disabled:opacity-50">
                    {isSaving ? 'Menyimpan...' : 'Simpan Role'}
                  </button>
                </div>
              </form>
            </div>
          ) : !selectedRole ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <Shield size={48} className="opacity-20 mb-3" />
              <p>Pilih role di sebelah kiri untuk mengatur permission</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center">
                  <CheckSquare className="text-emerald-500 mr-2.5" size={20} />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mr-3">
                    Hak Akses: <span className="text-primary">{selectedRole.name}</span>
                  </h3>
                  {selectedRole.name !== 'super_admin' && (
                    <div className="flex items-center gap-2">
                      <button onClick={handleEditRole} className="p-1.5 text-slate-400 hover:text-indigo-500 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors" title="Edit Role">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={handleDeleteRole} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors" title="Hapus Role">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions?.map((p: any) => {
                    const isChecked = selectedPermissions.includes(p.name);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePermission(p.name)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-primary/5 border-primary/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700 dark:bg-slate-900'}`}
                      >
                        {isChecked ? <CheckSquare className="text-primary" size={20} /> : <Square className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" size={20} />}
                        <div>
                          <p className={`text-sm font-medium ${isChecked ? 'text-primary-dark' : 'text-slate-700 dark:text-slate-200'}`}>{p.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
