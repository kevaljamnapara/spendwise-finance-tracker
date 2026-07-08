import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Global Authentication Context
 * 
 * Manages the global authentication state for the React application.
 * Using Context avoids "Prop Drilling" and provides a centralized store for the 
 * current user's profile and authentication methods (login, logout), making it 
 * accessible to any component in the app via `useAuth()`.
 */

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkUser = async () => {
      try {
        const { data } = await authService.getMe();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Allow component UI to handle any failure state if needed, avoid console litter
    }
  };

  const updateProfile = async (profileData) => {
    const { data } = await authService.updateProfile(profileData);
    setUser(data);
    return data;
  };

  const changePassword = async (passwordData) => {
    const response = await authService.changePassword(passwordData);
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
