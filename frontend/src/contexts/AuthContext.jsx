import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('agrifather_token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error('Auth error:', err);
      localStorage.removeItem('agrifather_token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = data;
    
    localStorage.setItem('agrifather_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await axios.post('/auth/register', userData);
    const { token: newToken, user: newUser } = data;
    
    localStorage.setItem('agrifather_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('agrifather_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const isPro = user?.plan === 'pro' && 
    (!user?.plan_expires_at || new Date(user.plan_expires_at) > new Date());

  return (
    <AuthContext.Provider value={{
      user, loading, token, isPro,
      login, register, logout, updateUser, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { API_BASE };
