import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    // For simplicity, don't fetch on init, assume user logs in again if needed
    return null;
  });

  const login = async (email: string, pass: string) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
    } else {
      throw new Error(data.error);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
    } else {
      throw new Error(data.error);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
  };
  
  const updateUser = async (updatedUser: User) => {
    if (!currentUser || currentUser.id !== updatedUser.id) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/user/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(updatedUser)
    });
    if (response.ok) {
      const data = await response.json();
      setCurrentUser(data);
    } else {
      // Handle error, perhaps throw
      throw new Error('Update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};