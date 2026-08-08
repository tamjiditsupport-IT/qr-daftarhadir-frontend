import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../utils/axios';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/');
      }
    } catch (err: any) {
      if (!err.response) {
        setError('Gagal terhubung ke server (Network Error). Pastikan backend berjalan dengan --host=0.0.0.0');
      } else {
        setError(err.response?.data?.message || 'Email/Username atau Password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Selamat Datang 👋</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Silakan masuk menggunakan kredensial Anda.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="pt-2">
          <input
            type="text"
            name="email_or_username"
            value={formData.email_or_username}
            onChange={handleChange}
            required
            className="w-full py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white text-slate-900 dark:text-white outline-none transition-colors text-sm font-semibold placeholder:text-slate-400 placeholder:font-medium"
            placeholder="Email / Username"
          />
        </div>

        <div className="pt-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-3 pr-10 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white text-slate-900 dark:text-white outline-none transition-colors text-sm font-semibold placeholder:text-slate-400 placeholder:font-medium"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#1c1c1e] hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 mt-8 transform active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk ke Dashboard</span>
          )}
        </button>
      </form>
    </div>
  );
}
