import React from 'react';
import { DateCategory, BudgetOption, DressCodeOption } from './types';

export const DATE_CATEGORIES: DateCategory[] = [
  DateCategory.FoodAndDrink,
  DateCategory.OutdoorsAndAdventure,
  DateCategory.ArtsAndCulture,
  DateCategory.Nightlife,
  DateCategory.RelaxingAndCasual,
  DateCategory.ActiveAndFitness,
  DateCategory.Adult,
];

export const BUDGET_OPTIONS: BudgetOption[] = ['Free', '$', '$$', '$$$'];
// FIX: Added 'Activewear' to provide it as an option for users creating dates.
export const DRESS_CODE_OPTIONS: DressCodeOption[] = ['Casual', 'Smart Casual', 'Formal', 'Activewear'];

export const WEEKLY_CHALLENGES = [
  "Foodie Week: Plan a date around a unique dish.",
  "Movie Magic: Create a date inspired by a film genre.",
  "Budget Ballers: A memorable date for under $20.",
  "Adventure Awaits: An outdoor or thrill-seeking date.",
  "Cozy & Casual: A relaxed, low-pressure date idea.",
  "Learn Something New: A date that involves a new skill.",
  "Night Owl's Dream: The perfect late-night experience.",
];

export const GRADIENT_CLASSES = [
  'from-pink-500 to-purple-600',
  'from-cyan-400 to-blue-600',
  'from-green-400 to-teal-500',
  'from-yellow-400 to-orange-500',
  'from-red-500 to-rose-600',
  'from-indigo-500 to-violet-600',
  'from-fuchsia-500 to-pink-600',
];

export const getRandomGradient = () => {
  return GRADIENT_CLASSES[Math.floor(Math.random() * GRADIENT_CLASSES.length)];
};

export const HeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const ChatIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

export const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const PremiumIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m2-3l3 3m-5 12l3 3m-2-3l-3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m2-3l3 3m-5 12l3 3m-2-3l-3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM12 12a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

export const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const PlaneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1.5M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2m0 0c1.11 0 2.08-.402 2.599-1M12 14v.01V15m0 .01V17m-3.401-9.002a2.5 2.5 0 00-4.198-.001M15.401 9a2.5 2.5 0 014.198-.001M5 12a2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 015 0A2.5 2.5 0 015 12zm14 0a2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 015 0A2.5 2.5 0 0119 12z" />
  </svg>
);

export const TagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM13 11a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

export const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);