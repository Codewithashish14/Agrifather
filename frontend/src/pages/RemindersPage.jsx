import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Check, Trash2, Bell, Droplets, Leaf, Wheat, Calendar } from 'lucide-react';

const TYPES = [
  { id: 'watering', label: 'Watering', icon: <Droplets size={14}/>, color: 'bg-blue-100 text-blue-700' },
  { id: 'fertilizing', label: 'Fertilizing', icon: <Leaf size={14}/>, color: 'bg-green-100 text-green-700' },
  { id: 'spraying', label: 'Spraying', icon: <Wheat size={14}/>, color: 'bg-amber-100 text-amber-700' },
  { id: 'harvesting', label: 'Harvesting', icon: <Wheat size={14}/>, color: 'bg-orange-100 text-orange-700' },
  { id: 'sowing', label: 'Sowing', icon: <Leaf size={14}/>, color: 'bg-forest-100 text-forest-700' },
  { id: 'general', label: 'General', icon: <Bell size={14}/>, color: 'bg-stone-100 text-stone-600' },
];

const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.id, t]));

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', reminderDate: '', reminderType: 'general' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReminders(); }, []);

  const fetchReminders = async () => {
    try {
      const { data } = await axios.get('/reminders');
      setReminders(data.reminders);
    } catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  };

  const createReminder = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post('/reminders', form);
      setReminders(prev => [data.reminder, ...prev]);
      setForm({ title: '', description: '', reminderDate: '', reminderType: 'general' });
      setShowForm(false);
      toast.success('Reminder created! 🔔');
    } catch { toast.error('Failed to create reminder'); }
    finally { setSubmitting(false); }
  };

  const complete = async (id) => {
    try {
      await axios.put(`/reminders/${id}/complete`);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_completed: 1 } : r));
      toast.success('Marked as done! ✅');
    } catch { toast.error('Failed to update'); }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`/reminders/${id}`);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const pending = reminders.filter(r => !r.is_completed);
  const done = reminders.filter(r => r.is_completed);

  return (
    <div className="h-full overflow-y-auto bg-stone-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-forest-900">Farm Reminders</h1>
            <p className="text-xs text-stone-500 font-devanagari">खेती अनुस्मारक</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} /> Add Reminder
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={createReminder} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-800">New Reminder</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({...p, title: e.target.value}))}
                placeholder="e.g., Water wheat field"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Notes</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                placeholder="Additional details..."
                className="input-field resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.reminderDate}
                  onChange={e => setForm(p => ({...p, reminderDate: e.target.value}))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Type</label>
                <select
                  value={form.reminderType}
                  onChange={e => setForm(p => ({...p, reminderType: e.target.value}))}
                  className="input-field"
                >
                  {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Saving...' : 'Save Reminder'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-shrink-0">Cancel</button>
            </div>
          </form>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: reminders.length, icon: '📋', color: 'bg-stone-100' },
            { label: 'Pending', value: pending.length, icon: '⏰', color: 'bg-amber-50' },
            { label: 'Done', value: done.length, icon: '✅', color: 'bg-forest-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 text-center border border-stone-200`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-bold text-stone-800">{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending reminders */}
        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="shimmer h-20 rounded-xl"/>)}</div>
        ) : (
          <>
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-3">Pending • {pending.length}</h2>
                <div className="space-y-3">
                  {pending.map(r => (
                    <ReminderCard key={r.id} r={r} onComplete={complete} onDelete={remove} />
                  ))}
                </div>
              </div>
            )}

            {done.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-3">Completed • {done.length}</h2>
                <div className="space-y-3 opacity-70">
                  {done.slice(0, 5).map(r => (
                    <ReminderCard key={r.id} r={r} onDelete={remove} done />
                  ))}
                </div>
              </div>
            )}

            {reminders.length === 0 && (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">No reminders yet</p>
                <p className="text-stone-400 text-sm mt-1">Add reminders for watering, spraying, harvesting and more</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReminderCard({ r, onComplete, onDelete, done }) {
  const typeInfo = TYPE_MAP[r.reminder_type] || TYPE_MAP.general;
  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm flex items-start gap-3 ${done ? 'border-stone-200' : 'border-stone-200 hover:border-forest-300 hover:shadow-agri'} transition-all`}>
      <div className={`flex-shrink-0 p-2 rounded-lg ${typeInfo.color} mt-0.5`}>{typeInfo.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${done ? 'line-through text-stone-400' : 'text-stone-800'}`}>{r.title}</p>
        {r.description && <p className="text-xs text-stone-500 mt-0.5 truncate">{r.description}</p>}
        {r.reminder_date && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-stone-400">
            <Calendar size={11}/>
            {new Date(r.reminder_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!done && onComplete && (
          <button onClick={() => onComplete(r.id)} className="p-2 text-stone-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-all" title="Mark done">
            <Check size={15} />
          </button>
        )}
        <button onClick={() => onDelete(r.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
