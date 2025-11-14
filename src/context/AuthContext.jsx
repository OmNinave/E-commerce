import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiService from '../services/api';

const STORAGE_KEYS = {
  currentUser: 'prolab_auth_current_user'
};

const AuthContext = createContext({});

const setCurrentUser = (user) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
};

const loadCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
};

const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setUser(loadCurrentUser());
    setIsInitializing(false);
  }, []);

  const registerUser = async ({ fullName, email, password }) => {
    try {
      // Register via backend API - saves to unified database
      const newUser = await apiService.registerUser({ fullName, email, password });
      const sanitized = sanitizeUser(newUser);
      setCurrentUser(sanitized);
      setUser(sanitized);
      return sanitized;
    } catch (error) {
      // If API fails, throw error with message
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  };

  const loginUser = async ({ email, password }) => {
    try {
      // Login via backend API - updates last login in unified database
      const existingUser = await apiService.loginUser({ email, password });
      const sanitized = sanitizeUser(existingUser);
      setCurrentUser(sanitized);
      setUser(sanitized);
      return sanitized;
    } catch (error) {
      // If API fails, throw error with message
      throw new Error(error.message || 'Invalid email or password.');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      isAuthenticated: Boolean(user),
      registerUser,
      loginUser,
      logout
    }),
    [user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
