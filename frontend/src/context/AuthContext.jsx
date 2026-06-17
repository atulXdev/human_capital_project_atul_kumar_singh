import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Settings: Theme and Preferences
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'vercel-dark');
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      defaultCountry: 'IND',
      refreshInterval: 'never',
      compactMode: false,
    };
  });

  // Verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Failed to verify token:', err);
          // Token is invalid/expired
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('theme', theme);
    
    if (theme === 'midnight-purple') {
      root.style.setProperty('--color-accent', '#a855f7');
      root.style.setProperty('--color-accent-hover', '#9333ea');
      root.style.setProperty('--color-bg', '#070414');
      root.style.setProperty('--color-bg-card', '#120e2e');
      root.style.setProperty('--color-bg-card-hover', '#1a1442');
      root.style.setProperty('--color-border', '#2d225c');
      root.style.setProperty('--color-primary', '#f3e8ff');
    } else if (theme === 'cyberpunk-green') {
      root.style.setProperty('--color-accent', '#10b981');
      root.style.setProperty('--color-accent-hover', '#059669');
      root.style.setProperty('--color-bg', '#020617');
      root.style.setProperty('--color-bg-card', '#0f172a');
      root.style.setProperty('--color-bg-card-hover', '#1e293b');
      root.style.setProperty('--color-border', '#334155');
      root.style.setProperty('--color-primary', '#f8fafc');
    } else {
      // Default vercel-dark
      root.style.setProperty('--color-accent', '#0070f3');
      root.style.setProperty('--color-accent-hover', '#0761d1');
      root.style.setProperty('--color-bg', '#000000');
      root.style.setProperty('--color-bg-card', '#0a0a0a');
      root.style.setProperty('--color-bg-card-hover', '#171717');
      root.style.setProperty('--color-border', '#333333');
      root.style.setProperty('--color-primary', '#ffffff');
    }
  }, [theme]);

  // Sync preferences
  const updatePreferences = (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('preferences', JSON.stringify(updated));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      // Depending on the backend response structure
      // e.g. response is { token, user } or just token and we fetch /me
      let jwtToken = '';
      let userData = null;

      if (typeof response === 'string') {
        jwtToken = response;
      } else if (response && response.token) {
        jwtToken = response.token;
        userData = response.user;
      }

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      
      if (userData) {
        setUser(userData);
      } else {
        const me = await api.getMe();
        setUser(me);
      }
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role = 'user') => {
    setLoading(true);
    try {
      const response = await api.register({ name, email, password, role });
      let jwtToken = '';
      let userData = null;

      if (typeof response === 'string') {
        jwtToken = response;
      } else if (response && response.token) {
        jwtToken = response.token;
        userData = response.user;
      }

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);

      if (userData) {
        setUser(userData);
      } else {
        const me = await api.getMe();
        setUser(me);
      }
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout endpoint failed or not fully supported, clearing state locally.', e);
    }
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      theme,
      setTheme,
      preferences,
      updatePreferences,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}