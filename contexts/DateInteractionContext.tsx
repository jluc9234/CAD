import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { DateIdea, Match, MatchData } from '../types';
import { useAuth } from './AuthContext';
import { useMatch } from './MatchContext';
import { apiService } from '../services/apiService';
import { useNotification } from './NotificationContext';

interface DateInteractionContextType {
  interests: Map<number, { matchId: number }>;
  toggleInterest: (dateIdea: DateIdea) => void;
  isTogglingInterest: Set<number>;
}

const DateInteractionContext = createContext<DateInteractionContextType | undefined>(undefined);

export const DateInteractionProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { matches, fetchMatches } = useMatch();
  const { addNotification } = useNotification();
  
  const [interests, setInterests] = useState<Map<number, { matchId: number }>>(new Map());
  const [isTogglingInterest, setIsTogglingInterest] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (currentUser && matches) {
      const newInterests = new Map<number, { matchId: number }>();
      for (const match of matches) {
        if (match.interestType === 'date' && match.dateIdeaId) {
           // Check if current user is the one who showed interest (not the author)
           // FIX: The 'Match' type from useMatch contains the other user, not a 'participants' array.
           // The check for inclusion of the current user is redundant as getMatches already handles this.
           // The important logic is checking that the current user is not the author of the date idea.
           if (currentUser.id !== match.dateAuthorId) {
               newInterests.set(match.dateIdeaId, { matchId: match.id });
           }
        }
      }
      setInterests(newInterests);
    }
  }, [matches, currentUser]);

  const toggleInterest = useCallback(async (dateIdea: DateIdea) => {
    if (!currentUser || currentUser.id === dateIdea.authorId) return;

    setIsTogglingInterest(prev => new Set(prev).add(dateIdea.id));

    const isInterested = interests.has(dateIdea.id);

    try {
      if (isInterested) {
        // --- Revoke Interest ---
        const { matchId } = interests.get(dateIdea.id)!;
        await apiService.removeMatch(matchId);
        addNotification(`You are no longer interested in "${dateIdea.title}".`, 'info');
      } else {
        // --- Send Interest ---
        await apiService.createDateInterestMatch(currentUser.id, dateIdea);
        addNotification(`Interest sent for "${dateIdea.title}"! A 3-day chat has opened.`, 'interest');
      }
      // Refresh all matches to get the latest state
      await fetchMatches();
    } catch (error) {
      console.error("Failed to toggle interest:", error);
      addNotification("An error occurred. Please try again.", 'info');
    } finally {
      setIsTogglingInterest(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateIdea.id);
        return newSet;
      });
    }
  }, [interests, currentUser, fetchMatches, addNotification]);

  return (
    <DateInteractionContext.Provider value={{ interests, toggleInterest, isTogglingInterest }}>
      {children}
    </DateInteractionContext.Provider>
  );
};

export const useDateInteraction = (): DateInteractionContextType => {
  const context = useContext(DateInteractionContext);
  if (context === undefined) {
    throw new Error('useDateInteraction must be used within a DateInteractionProvider');
  }
  return context;
};