import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // You could decode to check for expiry here if needed
          const decodedToken: { id: string } = jwtDecode(token);
          const userProfile = await apiService.getUserProfile(decodedToken.id);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Session check failed:", error);
          // Token is invalid or expired, so log out
          localStorage.removeItem('authToken');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  const fetchAndSetUser = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        const decodedToken: { id: string } = jwtDecode(token);
        const userProfile = await apiService.getUserProfile(decodedToken.id);
        setCurrentUser(userProfile);
    }
  };

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

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Add jwt-decode to the importmap or as a script tag to make it available globally
// A simple way to do this without changing index.html for this context
// is to dynamically load the script.
const script = document.createElement('script');
script.src = 'https://unpkg.com/jwt-decode@4.0.0/build/jwt-decode.js';
script.async = true;
document.head.appendChild(script);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
