export enum DateCategory {
  FoodAndDrink = 'Food & Drink',
  OutdoorsAndAdventure = 'Outdoors & Adventure',
  ArtsAndCulture = 'Arts & Culture',
  Nightlife = 'Nightlife',
  RelaxingAndCasual = 'Relaxing & Casual',
  ActiveAndFitness = 'Active & Fitness',
  Adult = 'Adult (18+)',
  Uncategorized = 'Uncategorized',
}

export type BudgetOption = 'Not Set' | 'Free' | '$' | '$$' | '$$$';
// FIX: Added 'Activewear' to the DressCodeOption type to allow for fitness-related date ideas.
export type DressCodeOption = 'Not Set' | 'Casual' | 'Smart Casual' | 'Formal' | 'Activewear';


export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  phone?: string;
  password?: string; // In a real app, this would be a hash
  bio: string;
  images: string[];
  interests: string[];
  background?: string; // Can be a data URL for uploaded/generated images
  isPremium: boolean;
}

export interface DateIdea {
  id: number;
  title: string;
  description: string;
  category: DateCategory;
  authorId: number;
  authorName: string;
  authorImage: string;
  location?: string;
  date?: string; // ISO string for the date
  isOutOfTown?: boolean;
  budget?: BudgetOption;
  dressCode?: DressCodeOption;
}

export interface Message {
  id: number;
  senderId: number; // User ID of the sender
  text: string;
  timestamp: string;
}

export interface Match {
  id: number;
  user: User; // The other user in the match
  messages: Message[];
  interestType: 'swipe' | 'date';
  interestExpiresAt?: string | null; // ISO string for expiry, or null if permanent
  dateIdeaId?: number;
  dateAuthorId?: number;
}

// This is how a match would be represented in a database
export interface MatchData {
    id: number;
    participants: number[]; // Array of two user IDs
    messages: Message[];
    interestType: 'swipe' | 'date';
    interestExpiresAt?: string | null;
    dateIdeaId?: number;
    dateAuthorId?: number;
}


export type ActiveView = 'swipe' | 'dates' | 'matches' | 'profile';

export type NotificationType = 'match' | 'interest' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  read?: boolean;
}

export interface LocalIdea {
    name: string;
    idea: string;
}

export interface LocalEvent {
    eventName:string;
    description: string;
}

export interface DateSuggestion {
    title: string;
    description: string;
}