import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { Shield, Save, CheckSquare, Square } from 'lucide-react';

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 flex items-center bg-slate-50/50 dark:bg-slate-900/50">
            <Shield className="text-primary mr-2.5" size={20} />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Daftar Role</h3>
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
          {!selectedRole ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <Shield size={48} className="opacity-20 mb-3" />
              <p>Pilih role di sebelah kiri untuk mengatur permission</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center">
                  <CheckSquare className="text-emerald-500 mr-2.5" size={20} />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    Hak Akses: <span className="text-primary">{selectedRole.name}</span>
                  </h3>
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
