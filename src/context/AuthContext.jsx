import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEYS = {
  users: 'prolab_auth_users',
  currentUser: 'prolab_auth_current_user'
};

const AuthContext = createContext({});

const getUsers = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = window.localStorage.getItem(STORAGE_KEYS.users);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const setUsers = (users) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
};

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

const hashPassword = async (password) => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return password;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((existing) => existing.email === normalizedEmail)) {
      throw new Error('An account already exists with this email.');
    }
    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: `user_${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    const sanitized = sanitizeUser(newUser);
    setCurrentUser(sanitized);
    setUser(sanitized);
    return sanitized;
  };

  const loginUser = async ({ email, password }) => {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(password);
    const existingUser = users.find(
      (record) => record.email === normalizedEmail && record.password === hashedPassword
    );
    if (!existingUser) {
      throw new Error('Invalid email or password.');
    }
    const sanitized = sanitizeUser(existingUser);
    setCurrentUser(sanitized);
    setUser(sanitized);
    return sanitized;
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
