import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import { setAccessToken, clearAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount via refresh token from LocalStorage/cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const localRefreshToken = localStorage.getItem('refreshToken');
        const { data } = await authApi.refresh(localRefreshToken);
        setAccessToken(data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        setUser(data.user);
      } catch {
        // No valid session
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const { data } = await authApi.signup(userData);
    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const localRefreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(localRefreshToken);
    } finally {
      clearAccessToken();
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
