import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  setPremium: (isPremium: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const item = window.localStorage.getItem('isPremium');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.error(error);
      return false;
    }
  });

  const setPremium = (value: boolean) => {
     try {
        setIsPremium(value);
        window.localStorage.setItem('isPremium', JSON.stringify(value));
     } catch (error) {
        console.error("Could not save premium status to localStorage", error);
     }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, setPremium }}>
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
