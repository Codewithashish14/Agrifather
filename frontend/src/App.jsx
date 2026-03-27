import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import ChatPage from './pages/ChatPage';
import WeatherPage from './pages/WeatherPage';
import MarketPage from './pages/MarketPage';
import RemindersPage from './pages/RemindersPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import LoadingScreen from './components/LoadingScreen';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ChatPage />} />
        <Route path="chat/:convId?" element={<ChatPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="pricing" element={<PricingPage embedded />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'Source Sans 3', sans-serif",
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
