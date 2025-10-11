import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Match, User } from '../types';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

interface MatchContextType {
  matches: Match[];
  addMatch: (user: User) => Promise<void>;
  isLoading: boolean;
  fetchMatches: () => Promise<void>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();
  const { currentUser } = useAuth();

  const fetchMatches = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        const userMatches = await apiService.getMatches(currentUser.id);
        setMatches(userMatches);
    } catch (error) {
        console.error("Failed to fetch matches:", error);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);


  const addMatch = useCallback(async (user: User) => {
    if (!currentUser) return;

    // Prevent adding duplicate matches for a smoother UX
    if (matches.some(match => match.user.id === user.id)) {
      return;
    }

    try {
        await apiService.addMatch(currentUser.id, user.id);
        // After successfully creating the match in the "backend", refetch the list
        await fetchMatches();
        addNotification(`You matched with ${user.name}! Send them a message.`, 'match');
    } catch (error) {
        console.error("Failed to add match:", error);
        addNotification(`Could not create match with ${user.name}.`, 'info');
    }
  }, [matches, addNotification, currentUser, fetchMatches]);


  return (
    <MatchContext.Provider value={{ matches, addMatch, isLoading, fetchMatches }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};