import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MessageSquare from 'lucide-react/lib/icons/message-square';
import Cloud from 'lucide-react/lib/icons/cloud';
import TrendingUp from 'lucide-react/lib/icons/trending-up';
import Bell from 'lucide-react/lib/icons/bell';
import User from 'lucide-react/lib/icons/user';
import Crown from 'lucide-react/lib/icons/crown';
import LogOut from 'lucide-react/lib/icons/log-out';
import Menu from 'lucide-react/lib/icons/menu';
import X from 'lucide-react/lib/icons/x';
import Sprout from 'lucide-react/lib/icons/sprout';
import ChevronRight from 'lucide-react/lib/icons/chevron-right';
import Settings from 'lucide-react/lib/icons/settings';
import AlertTriangle from 'lucide-react/lib/icons/alert-triangle';
import Mic from 'lucide-react/lib/icons/mic';
import toast from 'react-hot-toast';

const navItems = [
  { icon: MessageSquare, label: 'AI Chat', labelHi: 'AI चैट', path: '/dashboard' },
  { icon: Cloud, label: 'Weather', labelHi: 'मौसम', path: '/dashboard/weather' },
  { icon: TrendingUp, label: 'Market Prices', labelHi: 'बाज़ार भाव', path: '/dashboard/market' },
  { icon: Bell, label: 'Reminders', labelHi: 'रिमाइंडर', path: '/dashboard/reminders' },
  { icon: User, label: 'Profile', labelHi: 'प्रोफाइल', path: '/dashboard/profile' },
];

export default function DashboardLayout() {
  const { user, logout, isPro } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/chat');
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-forest-400 to-forest-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-xl">🌾</span>
          </div>
          <div>
            <h1 className="text-white font-display font-bold text-lg leading-tight">AGRIFATHER</h1>
            <p className="text-forest-300 text-xs font-devanagari">अग्रीफादर</p>
          </div>
        </div>
      </div>

      {/* User Badge */}
      <div className="px-4 py-3 border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.name}</p>
            <p className="text-forest-400 text-xs truncate">{user?.email}</p>
          </div>
          {isPro && (
            <span className="flex-shrink-0 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              PRO
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-forest-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Main Menu</p>
        {navItems.map(({ icon: Icon, label, labelHi, path }) => (
          <button
            key={path}
            onClick={() => { navigate(path); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive(path)
                ? 'bg-forest-600 text-white shadow-sm'
                : 'text-forest-200 hover:bg-forest-800 hover:text-white'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            <span className="text-xs opacity-60 font-devanagari">{labelHi}</span>
          </button>
        ))}

        {/* Upgrade button if not pro */}
        {!isPro && (
          <div className="mt-4 pt-4 border-t border-forest-800">
            <button
              onClick={() => { navigate('/dashboard/pricing'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Crown size={18} />
              <span className="flex-1 text-left">Upgrade to Pro</span>
              <ChevronRight size={14} />
            </button>
            <p className="text-forest-400 text-xs text-center mt-2">
              {user?.messages_today || 0}/10 free messages today
            </p>
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-forest-800 space-y-1">
        <button
          onClick={() => { navigate('/dashboard/profile'); setSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-forest-300 hover:bg-forest-800 hover:text-white transition-all duration-200"
        >
          <Settings size={16} />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-72 bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 flex flex-col shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-forest-300 hover:text-white p-1.5 rounded-lg hover:bg-forest-800 transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <span className="font-display font-bold text-forest-800 text-lg">AGRIFATHER</span>
          </div>
          {isPro && (
            <span className="ml-auto bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              PRO
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
