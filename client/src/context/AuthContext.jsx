import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * What this file does:
 * Manages the global authentication state for the React application using React Context.
 * 
 * Why this logic exists:
 * To avoid "prop drilling" (passing user data down through every component). 
 * This Context provides a centralized store for the current user's profile and authentication methods (login, logout), 
 * making it accessible to any component in the app.
 * 
 * Input: None directly. Uses `authService` to make API calls.
 * Output: Provides `{ user, loading, login, logout, updateProfile, changePassword }` to consuming components.
 * Flow:
 * 1. On initial load (`useEffect`), it calls the backend `/api/v1/auth/me` to check if a valid session exists.
 * 2. It stores the resulting user data in state.
 * 3. Any component can call `useAuth()` to get the current user or trigger auth actions.
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
      console.error('Logout failed', error);
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
