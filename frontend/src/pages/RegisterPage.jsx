import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    language: 'hi', state: '', district: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const f = k => e => setForm(p => ({...p, [k]: e.target.value}));

  const step1Valid = form.name.trim() && form.email.trim() && form.password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to AGRIFATHER! 🌾 Your farming journey begins!', { duration: 4000 });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-earth-900 via-forest-950 to-forest-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['🌾','🌱','🌽','🍅','🥬','🌻','🐄'].map((e, i) => (
            <span key={i} className="absolute text-4xl animate-float" style={{ left: `${8+i*14}%`, top: `${10+(i%4)*20}%`, animationDelay: `${i*0.7}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative text-center text-white">
          <div className="text-6xl mb-5">🌱</div>
          <h2 className="text-3xl font-display font-black mb-3">Join AGRIFATHER</h2>
          <p className="text-forest-300 mb-6">Start your smart farming journey today</p>
          <div className="space-y-3 text-left">
            {[
              '✅ Free forever with 10 messages/day',
              '✅ AI-powered crop & pest advisory',
              '✅ Hindi, English & 8 regional languages',
              '✅ Weather & market price updates',
              '✅ Government scheme guidance',
            ].map(b => (
              <p key={b} className="text-sm text-forest-200">{b}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <span className="text-3xl">🌾</span>
              <span className="font-display font-bold text-2xl text-forest-800">AGRIFATHER</span>
            </Link>
            <h1 className="text-2xl font-bold text-stone-800">Create Free Account</h1>
            <p className="text-stone-500 text-sm mt-1">मुफ्त खाता बनाएं • Join 50,000+ farmers</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-forest-600' : 'bg-stone-200'}`}/>
            ))}
          </div>
          <p className="text-xs text-stone-500 text-center mb-5">Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Farm Details'}</p>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); if (step1Valid) setStep(2); }}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name *</label>
                  <input type="text" value={form.name} onChange={f('name')} className="input-field" placeholder="Your full name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Address *</label>
                  <input type="email" value={form.email} onChange={f('email')} className="input-field" placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Mobile Number</label>
                  <input type="tel" value={form.phone} onChange={f('phone')} className="input-field" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={f('password')} className="input-field pr-12" placeholder="Min 6 characters" required minLength={6} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1">
                      {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={!step1Valid} className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  Next <ChevronRight size={16}/>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Preferred Language</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'hi', label: 'हिंदी' },
                      { code: 'en', label: 'English' },
                      { code: 'hi-en', label: 'Hinglish' },
                      { code: 'mr', label: 'मराठी' },
                      { code: 'gu', label: 'ગુજ.' },
                      { code: 'pa', label: 'ਪੰਜਾਬੀ' },
                    ].map(lang => (
                      <button key={lang.code} type="button" onClick={() => setForm(p => ({...p, language: lang.code}))}
                        className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${form.language === lang.code ? 'border-forest-500 bg-forest-50 text-forest-700' : 'border-stone-200 text-stone-600 hover:border-forest-300'}`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">State</label>
                    <select value={form.state} onChange={f('state')} className="input-field">
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">District</label>
                    <input type="text" value={form.district} onChange={f('district')} className="input-field" placeholder="Your district" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-shrink-0">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"/>
                        Creating account...
                      </span>
                    ) : '🌾 Start Farming Smarter!'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-stone-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:text-forest-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
