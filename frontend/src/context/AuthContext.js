import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };


  // Demo login for frontend-only demo
  const loginDemo = async (role) => {
    // Dummy users for demo
    const demoUsers = {
      admin: {
        id: 'demo-admin',
        email: 'admin@demo.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isOnboardingComplete: true
      },
      lender: {
        id: 'demo-lender',
        email: 'lender@demo.com',
        firstName: 'Lender',
        lastName: 'User',
        role: 'lender',
        isOnboardingComplete: true
      },
      borrower: {
        id: 'demo-borrower',
        email: 'borrower@demo.com',
        firstName: 'Borrower',
        lastName: 'User',
        role: 'borrower',
        isOnboardingComplete: true
      }
    };
    const user = demoUsers[role];
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loginDemo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
