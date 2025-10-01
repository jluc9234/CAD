import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const item = window.localStorage.getItem('currentUser');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const login = async (email: string, pass: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
        setCurrentUser(user);
        window.localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
       throw new Error("Invalid email or password");
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
    }
    const newUser: User = {
        id: Date.now(),
        name,
        email,
        password: pass,
        age: 18, // Default age
        bio: ``,
        images: [`https://picsum.photos/seed/${Date.now()}/800/1200`],
        interests: [],
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    window.localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setCurrentUser(null);
    window.localStorage.removeItem('currentUser');
  };
  
  const updateUser = (updatedUser: User) => {
    if (!currentUser || currentUser.id !== updatedUser.id) return;
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    window.localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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