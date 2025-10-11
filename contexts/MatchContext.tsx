import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
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
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

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
    if (currentUser) {
      fetchMatches(); // Initial fetch

      const intervalId = setInterval(async () => {
        if (document.hidden) return; // Don't poll if the tab is not active

        try {
          const newMatches = await apiService.getMatches(currentUser.id);
          const currentMatches = matchesRef.current;

          if (newMatches.length > currentMatches.length) {
            const existingMatchIds = new Set(currentMatches.map(m => m.id));
            const newMatch = newMatches.find(m => !existingMatchIds.has(m.id));
            if (newMatch) {
              addNotification(`You have a new match with ${newMatch.user.name}!`, 'match');
            }
          }
          
          setMatches(newMatches);
        } catch (error) {
          console.error("Background match fetch failed:", error);
        }
      }, 15000); // Poll for new matches every 15 seconds

      return () => clearInterval(intervalId);
    }
  }, [currentUser, fetchMatches, addNotification]);


  const addMatch = useCallback(async (user: User) => {
    if (!currentUser) return;

    try {
        const result = await apiService.addMatch(currentUser.id, user.id);
        if (result.matched) {
            // A mutual match was found and created in the backend.
            await fetchMatches();
            addNotification(`You matched with ${user.name}! Send them a message.`, 'match');
        }
    } catch (error) {
        console.error("Failed to process right swipe:", error);
        addNotification(`Could not process swipe on ${user.name}.`, 'info');
    }
  }, [currentUser, fetchMatches, addNotification]);


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