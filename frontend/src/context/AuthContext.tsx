import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, { email: string; pass: string; label: string }> = {
  artisan: {
    email: 'ramesh.varanasi@shilpai.in',
    pass: 'Artisan@2026',
    label: 'Ramesh Kumar (Master Silk Weaver, Varanasi)'
  },
  buyer: {
    email: 'procurement@fabcraft.com',
    pass: 'Buyer@2026',
    label: 'FabCraft India Procurement Head'
  },
  cluster_manager: {
    email: 'basavaraj.channapatna@shilpai.in',
    pass: 'Artisan@2026',
    label: 'Basavaraj Gowda (Channapatna Cluster Lead)'
  },
  admin: {
    email: 'admin@shilpai.in',
    pass: 'ShilpAI@2026',
    label: 'Platform Administrator & Moderator'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('shilpai_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setCurrentUser(data);
    } catch (err) {
      console.warn('Session expired or invalid, logging out');
      localStorage.removeItem('shilpai_token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('shilpai_token', data.access_token);
      await fetchProfile();
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const data = await api.register(formData);
      localStorage.setItem('shilpai_token', data.access_token);
      await fetchProfile();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('shilpai_token');
    setCurrentUser(null);
  };

  const quickSwitchRole = async (role: UserRole) => {
    const creds = DEMO_USERS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, quickSwitchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
