import { User, DateIdea, Match, Message, DateCategory, MatchData } from '../types';

// --- DATABASE SIMULATION ---
// In a real app, this data would live in your Supabase database.
// We use 'let' to make these arrays mutable, simulating database tables.
let USERS: User[] = [
  {
    id: 1,
    name: 'Chloe',
    age: 28,
    email: 'chloe@email.com',
    password: 'password123',
    phone: '111-222-3333',
    bio: 'Lover of art, adventure, and artisanal coffee. Looking for someone to explore new galleries and hiking trails with. Bonus points if you can make me laugh.',
    images: ['https://picsum.photos/seed/user1a/800/1200', 'https://picsum.photos/seed/user1b/800/1200', 'https://picsum.photos/seed/user1c/800/1200', 'https://picsum.photos/seed/user1d/800/1200', 'https://picsum.photos/seed/user1e/800/1200', 'https://picsum.photos/seed/user1f/800/1200'],
    interests: ['Hiking', 'Painting', 'Indie Music', 'Travel'],
    isPremium: true,
  },
  {
    id: 2,
    name: 'Marcus',
    age: 31,
    email: 'marcus@email.com',
    password: 'password123',
    phone: '222-333-4444',
    bio: 'Software engineer by day, musician by night. I find joy in coding elegant solutions and composing heartfelt melodies. Searching for a partner in crime for spontaneous road trips and late-night jam sessions.',
    images: ['https://picsum.photos/seed/user2a/800/1200', 'https://picsum.photos/seed/user2b/800/1200'],
    interests: ['Guitar', 'Cooking', 'Sci-Fi Movies', 'Craft Beer'],
    isPremium: false,
  },
  {
    id: 3,
    name: 'Sophia',
    age: 26,
    email: 'sophia@email.com',
    password: 'password123',
    bio: 'Fitness enthusiast and foodie. My perfect weekend involves a morning run followed by brunch. Let\'s challenge each other at the gym and then reward ourselves with tacos.',
    images: ['https://picsum.photos/seed/user3a/800/1200', 'https://picsum.photos/seed/user3b/800/1200', 'https://picsum.photos/seed/user3c/800/1200'],
    interests: ['Yoga', 'Weightlifting', 'Brunch', 'Dogs'],
    isPremium: false,
  },
  {
    id: 4,
    name: 'Leo',
    age: 29,
    email: 'demo@user.com',
    password: 'password',
    phone: '555-555-5555',
    bio: 'Just a guy who loves dogs, dad jokes, and deep conversations. I can usually be found at a dog park or trying to learn a new recipe. Tell me your best worst joke.',
    images: ['https://picsum.photos/seed/user4a/800/1200', 'https://picsum.photos/seed/user4b/800/1200'],
    interests: ['Dogs', 'Comedy', 'Cooking', 'Podcasts'],
    isPremium: false,
  }
];

let DATE_IDEAS: DateIdea[] = [
  {
    id: 1,
    title: 'Stargazing Picnic with Hot Cocoa',
    description: 'Let\'s escape the city lights for a night. We can pack a blanket, a thermos of delicious hot cocoa, and some snacks. We\'ll find a quiet spot, lay back, and watch the stars while sharing stories. It\'s simple, romantic, and a great way to connect.',
    category: DateCategory.OutdoorsAndAdventure,
    authorId: 2,
    authorName: 'Marcus',
    authorImage: 'https://picsum.photos/seed/user2/100/100',
    location: 'Griffith Observatory, Los Angeles',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    budget: '$',
    dressCode: 'Casual',
  },
   {
    id: 2,
    title: 'Competitive Pottery Throwing Class',
    description: 'Ready to get our hands dirty? We\'ll take a beginner\'s pottery class and see who can make the least wobbly bowl. Loser buys the victory drinks afterward. A fun way to be creative and a little competitive.',
    category: DateCategory.ArtsAndCulture,
    authorId: 1,
    authorName: 'Chloe',
    authorImage: 'https://picsum.photos/seed/user1/100/100',
    budget: '$$',
    dressCode: 'Casual',
  },
];

// FIX: Changed type from Match[] to MatchData[] to correctly represent the data structure with participant IDs.
let MATCHES: MatchData[] = [
  {
    id: 1,
    participants: [4, 1], 
    messages: [
        { id: 1, senderId: 1, text: "Hey! I loved your date idea about the pottery class, I'm terrible at art but it sounds fun!", timestamp: "10:30 AM" },
        { id: 2, senderId: 4, text: "Haha thanks! Being terrible is half the fun. You're an artist, right? You must have some creative bones.", timestamp: "10:32 AM" },
    ],
    interestType: 'swipe',
    interestExpiresAt: null,
  },
  {
    id: 2,
    participants: [4, 3], // Leo and Sophia
    messages: [
        { id: 1, senderId: 3, text: "A sunrise hike followed by a brewery sounds like my perfect day.", timestamp: "Yesterday" },
    ],
    interestType: 'swipe',
    interestExpiresAt: null,
  }
];

// --- API FUNCTIONS ---
// These functions simulate making API calls to a backend.
// They are all async and have a delay to mimic network latency.

const apiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const apiService = {
  // --- AUTH ---
  async login(email: string, pass: string): Promise<User | null> {
    await apiDelay(500);
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      return { ...user }; // Return a copy
    }
    throw new Error("Invalid email or password");
  },

  async signup(name: string, email: string, pass: string): Promise<User> {
      await apiDelay(500);
      if (USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("An account with this email already exists.");
      }
      const newUser: User = {
          id: Date.now(),
          name,
          email,
          password: pass,
          age: 18,
          bio: ``,
          images: [`https://picsum.photos/seed/${Date.now()}/800/1200`],
          interests: [],
          isPremium: false,
      };
      USERS.push(newUser);
      return { ...newUser };
  },

  async updateUser(updatedUser: User): Promise<User> {
    await apiDelay(300);
    USERS = USERS.map(u => u.id === updatedUser.id ? updatedUser : u);
    return { ...updatedUser };
  },

  // --- SWIPING ---
  async getUsersToSwipe(currentUserId: number): Promise<User[]> {
      await apiDelay(400);
      // In a real app, you'd also filter out users you've already swiped on.
      return USERS.filter(u => u.id !== currentUserId);
  },
  
  // --- MATCHES & CHAT ---
  async getMatches(currentUserId: number): Promise<Match[]> {
      await apiDelay(600);
      const userMatches = MATCHES.filter(m => m.participants.includes(currentUserId));
      
      return userMatches.map(matchData => {
          const otherUserId = matchData.participants.find(pId => pId !== currentUserId)!;
          const otherUser = USERS.find(u => u.id === otherUserId)!;
          return {
              id: matchData.id,
              user: otherUser,
              messages: matchData.messages,
              interestType: matchData.interestType,
              interestExpiresAt: matchData.interestExpiresAt,
              dateIdeaId: matchData.dateIdeaId,
              dateAuthorId: matchData.dateAuthorId,
          };
      }).sort((a,b) => b.id - a.id); // Sort by most recent
  },

  async addMatch(currentUserId: number, targetUserId: number): Promise<void> {
      await apiDelay(200);
      const newMatchData: MatchData = {
          id: Date.now(),
          participants: [currentUserId, targetUserId],
          messages: [],
          interestType: 'swipe',
          interestExpiresAt: null,
      };
      MATCHES.push(newMatchData);
  },

  async createDateInterestMatch(currentUserId: number, dateIdea: DateIdea): Promise<void> {
    await apiDelay(300);
    const newMatchData: MatchData = {
      id: Date.now(),
      participants: [currentUserId, dateIdea.authorId],
      messages: [],
      interestType: 'date',
      interestExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      dateIdeaId: dateIdea.id,
      dateAuthorId: dateIdea.authorId,
    };
    MATCHES.push(newMatchData);
  },

  async removeMatch(matchId: number): Promise<void> {
    await apiDelay(300);
    MATCHES = MATCHES.filter(m => m.id !== matchId);
  },
  
  async sendMessage(matchId: number, senderId: number, text: string): Promise<Message> {
      await apiDelay(150);
      const matchIndex = MATCHES.findIndex(m => m.id === matchId);
      if (matchIndex === -1) {
        throw new Error("Match not found");
      }
      
      const match = MATCHES[matchIndex];
      
      // Logic to make match permanent if an interested user replies after expiry
      const isExpired = match.interestExpiresAt && new Date(match.interestExpiresAt) < new Date();
      if(match.interestType === 'date' && isExpired && senderId !== match.dateAuthorId) {
        match.interestExpiresAt = null; // Make it permanent!
        MATCHES[matchIndex] = match;
      }

      const newMessage: Message = {
        id: Date.now(),
        senderId,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      match.messages.push(newMessage);
      return newMessage;
  },

  // --- DATES ---
  async getDateIdeas(): Promise<DateIdea[]> {
    await apiDelay(500);
    return [...DATE_IDEAS].sort((a,b) => b.id - a.id); // Most recent first
  },
  
  async createDateIdea(newDate: Omit<DateIdea, 'id'>): Promise<DateIdea> {
    await apiDelay(400);
    const dateWithId = { ...newDate, id: Date.now() };
    DATE_IDEAS.unshift(dateWithId); // Add to the top of the list
    return dateWithId;
  },
};