import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const isPremium = currentUser?.isPremium || false;

  // In a real Supabase application, the `isPremium` status would be part of the
  // user's profile fetched from the database. A server-side webhook (e.g., from Stripe or PayPal)
  // would trigger a Supabase Function to update the user's premium status in the database upon
  // successful payment. The client would receive this update automatically via Supabase's
  // real-time subscriptions, or upon the next data refetch.

  return (
    <PremiumContext.Provider value={{ isPremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};