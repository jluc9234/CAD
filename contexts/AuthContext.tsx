import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: { id: string } = jwtDecode(token);
        const userProfile = await apiService.getUserProfile(decodedToken.id);
        setCurrentUser(userProfile);
      } catch (error) {
        console.error("Session check failed:", error);
        localStorage.removeItem('authToken');
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      await fetchAndSetUser();
      setLoading(false);
    };

    checkLoggedInUser();
  }, [fetchAndSetUser]);

  const login = async (email: string, pass: string) => {
    await apiService.login(email, pass);
    await fetchAndSetUser();
  };

  const signup = async (name: string, email: string, pass:string) => {
    await apiService.signup(name, email, pass);
    await fetchAndSetUser();
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
  };
  
  const updateUser = async (updatedUser: User) => {
    if (!currentUser || currentUser.id !== updatedUser.id) return;
    const user = await apiService.updateUser(updatedUser);
    setCurrentUser(user);
  };

  const refetchUser = useCallback(async () => {
    await fetchAndSetUser();
  }, [fetchAndSetUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, updateUser, refetchUser }}>
      {!loading && children}
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
