import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { supabase } from '../services/supabaseClient';

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
    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const userProfile = await apiService.getUserProfile(session.user.id);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Error fetching initial user profile:", error);
          // might need to sign out if profile doesn't exist
        }
      }
      setLoading(false);
    };

    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          try {
            const userProfile = await apiService.getUserProfile(session.user.id);
            setCurrentUser(userProfile);
          } catch (error) {
             console.error("Error fetching user profile on auth change:", error);
          }
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  const login = async (email: string, pass: string) => {
    await apiService.login(email, pass);
    // onAuthStateChange will handle state update
  };

  const signup = async (name: string, email: string, pass: string) => {
    await apiService.signup(name, email, pass);
    // onAuthStateChange will handle state update
  };

  const logout = async () => {
    await apiService.logout();
    setCurrentUser(null); // Set to null immediately for faster UI response
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};