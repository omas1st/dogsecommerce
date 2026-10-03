import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest, setInMemoryAuthToken, getInMemoryAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  demoLogin: (role: 'admin' | 'customer' | 'seller') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getInMemoryAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentToken = getInMemoryAuthToken();
      if (!currentToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await apiRequest<{ success: boolean; user: User }>('/auth/me');
      setUser(data.user);
    } catch (err) {
      setInMemoryAuthToken(null);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    setInMemoryAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => {
    const res = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setInMemoryAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setInMemoryAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role: 'admin' | 'customer' | 'seller') => {
    if (role === 'admin') {
      await login('admin@houndandharbor.com', 'AdminSecure2026!');
    } else if (role === 'seller') {
      await login('artisan@timberhound.com', 'CustomerPass123!');
    } else {
      await login('sarah.jenkins@example.com', 'CustomerPass123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
