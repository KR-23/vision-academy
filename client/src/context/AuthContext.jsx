import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Restore session on boot
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Session restore failed:', err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast(data.message || 'Welcome back!', 'success');
      return data.user;
    } catch (err) {
      toast(err.message, 'error');
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, role });
      if (role === 'instructor') {
        toast(data.message, 'info');
      } else {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast(data.message, 'success');
      }
      return data.user;
    } catch (err) {
      toast(err.message, 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast('Logged out successfully', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData);
      setUser(data.user);
      toast(data.message, 'success');
      return data.user;
    } catch (err) {
      toast(err.message, 'error');
      throw err;
    }
  };

  // Sync profile details manually if XP/Streak increases
  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error('Refresh user failed:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
