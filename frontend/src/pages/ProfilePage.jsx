import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Wheat, Volume2, AlignLeft, Lock, Crown, Calendar, CheckCircle } from 'lucide-react';

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];
const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'hi-en', label: 'Hinglish' }, { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' }, { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' }, { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }, { code: 'bn', label: 'বাংলা (Bengali)' },
];

export default function ProfilePage() {
  const { user, updateUser, refreshUser, isPro } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    language: user?.language || 'en',
    state: user?.state || '',
    district: user?.district || '',
    farm_size: user?.farm_size || '',
    primary_crops: user?.primary_crops || '',
    voice_enabled: user?.voice_enabled !== 0,
    response_style: user?.response_style || 'detailed',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [tab, setTab] = useState('profile');

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile saved! ✅');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 chars'); return; }
    setSavingPw(true);
    try {
      await axios.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed! 🔒');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="h-full overflow-y-auto bg-stone-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header & Avatar */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-950 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-forest-300 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {isPro ? (
                  <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <Crown size={11}/> PRO Active
                  </span>
                ) : (
                  <span className="bg-forest-700 text-forest-200 text-xs px-2.5 py-0.5 rounded-full">Free Plan</span>
                )}
                <span className="text-forest-400 text-xs">
                  Joined {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          {isPro && user?.plan_expires_at && (
            <div className="mt-4 flex items-center gap-2 bg-forest-700/40 rounded-xl px-4 py-2.5 text-sm">
              <Calendar size={14} className="text-amber-400"/>
              <span className="text-forest-200">Pro plan valid until:</span>
              <span className="font-semibold text-white">
                {new Date(user.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-stone-200 rounded-xl p-1 w-fit">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={14}/> },
            { id: 'preferences', label: 'Preferences', icon: <AlignLeft size={14}/> },
            { id: 'security', label: 'Security', icon: <Lock size={14}/> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-forest-600 text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-stone-800">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <input type="text" value={form.name} onChange={f('name')} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Mobile Number</label>
                <input type="tel" value={form.phone} onChange={f('phone')} className="input-field" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">State</label>
                <select value={form.state} onChange={f('state')} className="input-field">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">District</label>
                <input type="text" value={form.district} onChange={f('district')} className="input-field" placeholder="Your district" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Farm Size</label>
                <input type="text" value={form.farm_size} onChange={f('farm_size')} className="input-field" placeholder="e.g., 2 acres, 5 bigha" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Primary Crops</label>
                <input type="text" value={form.primary_crops} onChange={f('primary_crops')} className="input-field" placeholder="e.g., Wheat, Rice, Cotton" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {tab === 'preferences' && (
          <form onSubmit={saveProfile} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="font-semibold text-stone-800">App Preferences</h2>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Language / भाषा</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setForm(p => ({...p, language: lang.code}))}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      form.language === lang.code ? 'border-forest-500 bg-forest-50 text-forest-700' : 'border-stone-200 text-stone-600 hover:border-forest-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Response Style</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'detailed', label: 'Detailed', desc: 'Full explanations with steps', icon: '📖' },
                  { v: 'short', label: 'Short', desc: 'Quick, concise answers', icon: '⚡' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm(p => ({...p, response_style: opt.v}))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.response_style === opt.v ? 'border-forest-500 bg-forest-50' : 'border-stone-200 hover:border-forest-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <p className="font-semibold text-sm text-stone-800">{opt.label}</p>
                    <p className="text-xs text-stone-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-forest-600" />
                <div>
                  <p className="font-medium text-stone-800 text-sm">Voice Output</p>
                  <p className="text-xs text-stone-500">AI responses read aloud automatically</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.voice_enabled} onChange={f('voice_enabled')} className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-forest-400 rounded-full peer peer-checked:bg-forest-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        )}

        {tab === 'security' && (
          <form onSubmit={changePassword} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-stone-800">Change Password</h2>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({...p, currentPassword: e.target.value}))} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({...p, newPassword: e.target.value}))} className="input-field" required minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({...p, confirmPassword: e.target.value}))} className="input-field" required />
            </div>
            <button type="submit" disabled={savingPw} className="btn-primary w-full">
              {savingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
