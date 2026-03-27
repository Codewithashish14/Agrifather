import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Wheat } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to AGRIFATHER! 🌾');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['🌾','🌱','🌽','🍅','🥬','🌻','🐄','🌿'].map((e, i) => (
            <span key={i} className="absolute text-4xl animate-float" style={{ left: `${10 + i*12}%`, top: `${15 + (i%3)*25}%`, animationDelay: `${i*0.8}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative text-center text-white max-w-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-forest-400 to-forest-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-5xl">🌾</span>
          </div>
          <h2 className="text-4xl font-display font-black mb-3">AGRIFATHER</h2>
          <p className="text-forest-200 font-devanagari text-xl mb-2">अग्रीफादर</p>
          <p className="text-forest-300 text-base leading-relaxed">
            India's most advanced AI assistant for farmers. Expert advice in your language, 24/7.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {['🌾 Crop advisory', '🐛 Pest control', '💧 Irrigation tips', '🏛️ Govt schemes'].map(f => (
              <div key={f} className="bg-forest-800/60 rounded-xl px-3 py-2 text-sm text-forest-200 border border-forest-700">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🌾</span>
              <span className="font-display font-bold text-2xl text-forest-800">AGRIFATHER</span>
            </Link>
            <h1 className="text-2xl font-bold text-stone-800">Welcome back</h1>
            <p className="text-stone-500 text-sm mt-1">Sign in to your farming assistant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className="input-field pr-12"
                  placeholder="Your password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1">
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-99 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"/>
                  Signing in...
                </span>
              ) : 'Sign In to AGRIFATHER'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-stone-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-forest-600 hover:text-forest-700 font-semibold">
                Register Free
              </Link>
            </p>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-amber-800 text-xs">
              🌾 <strong>10 free messages/day</strong> on free plan • Upgrade to Pro for unlimited access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
