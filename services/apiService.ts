import { User, DateIdea, Match, Message, MatchData } from '../types';
import { supabase } from './supabaseClient';

// Helper function to handle Supabase errors
const handleSupabaseError = ({ error, data }: { error: any, data: any }, context?: string) => {
    if (error) {
        console.error(`Supabase error in ${context || 'operation'}:`, error.message);
        throw error;
    }
    return data;
};

export const apiService = {
  // --- AUTH ---
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    return handleSupabaseError({ data, error }, 'getUserProfile');
  },

  async login(email: string, pass: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw new Error(error.message);
  },

  async signup(name: string, email: string, pass: string): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Signup successful but no user data returned.");

    // Create a profile for the new user
    const newUserProfile = {
        id: authData.user.id,
        name,
        email: authData.user.email!,
        age: 18,
        bio: '',
        images: [`https://picsum.photos/seed/${authData.user.id}/800/1200`],
        interests: [],
        isPremium: false,
    };

    const { error: profileError } = await supabase.from('users').insert(newUserProfile);

    if (profileError) {
        // This is a tricky state. User is created in auth, but profile failed.
        // A real app would have better error handling or use a db trigger.
        console.error("Error creating user profile:", profileError.message);
        throw new Error("Could not create user profile after signup.");
    }
  },
  
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async updateUser(updatedUser: User): Promise<User> {
    const { id, ...updateData } = updatedUser;
    // Don't try to update email/password here.
    delete (updateData as any).email;
    delete (updateData as any).password;
    
    const { data, error } = await supabase.from('users').update(updateData).eq('id', id).select().single();
    return handleSupabaseError({ data, error }, 'updateUser');
  },

  // --- SWIPING ---
  async getUsersToSwipe(currentUserId: string): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').neq('id', currentUserId);
    return handleSupabaseError({ data, error }, 'getUsersToSwipe') || [];
  },
  
  // --- MATCHES & CHAT ---
  async getMatches(currentUserId: string): Promise<Match[]> {
    const { data: matchesData, error } = await supabase.from('matches').select('*').contains('participants', [currentUserId]);
    
    handleSupabaseError({ data: matchesData, error }, 'getMatches');
    if (!matchesData) return [];

    const otherUserIds = matchesData.map(m => m.participants.find((pId: string) => pId !== currentUserId)).filter(Boolean) as string[];
    if (otherUserIds.length === 0) return [];
    
    const { data: usersData, error: usersError } = await supabase.from('users').select('*').in('id', otherUserIds);
    handleSupabaseError({ data: usersData, error: usersError }, 'getMatches.users');
    if (!usersData) return [];
    
    const usersById = new Map(usersData.map(u => [u.id, u]));

    return matchesData.map((matchData: MatchData) => {
        const otherUserId = matchData.participants.find(pId => pId !== currentUserId)!;
        const otherUser = usersById.get(otherUserId)!;
        return {
            id: matchData.id,
            user: otherUser,
            messages: matchData.messages,
            interestType: matchData.interestType,
            interestExpiresAt: matchData.interestExpiresAt,
            dateIdeaId: matchData.dateIdeaId,
            dateAuthorId: matchData.dateAuthorId,
        };
    }).sort((a,b) => b.id - a.id);
  },

  async addMatch(currentUserId: string, targetUserId: string): Promise<void> {
    const newMatchData: Omit<MatchData, 'id' | 'messages'> = {
        participants: [currentUserId, targetUserId],
        interestType: 'swipe',
        interestExpiresAt: null,
    };
    const { error } = await supabase.from('matches').insert({ ...newMatchData, messages: [] });
    if (error) throw new Error(error.message);
  },

  async createDateInterestMatch(currentUserId: string, dateIdea: DateIdea): Promise<void> {
    const newMatchData: Omit<MatchData, 'id' | 'messages'> = {
      participants: [currentUserId, dateIdea.authorId],
      interestType: 'date',
      interestExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      dateIdeaId: dateIdea.id,
      dateAuthorId: dateIdea.authorId,
    };
    const { error } = await supabase.from('matches').insert({ ...newMatchData, messages: [] });
    if (error) throw new Error(error.message);
  },

  async removeMatch(matchId: number): Promise<void> {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) throw new Error(error.message);
  },
  
  async sendMessage(matchId: number, senderId: string, text: string): Promise<Message> {
      const { data: match, error: getError } = await supabase.from('matches').select('*').eq('id', matchId).single();
      if (getError || !match) throw new Error(getError?.message || "Match not found");
      
      const isExpired = match.interestExpiresAt && new Date(match.interestExpiresAt) < new Date();
      let interestExpiresAt = match.interestExpiresAt;

      if(match.interestType === 'date' && isExpired && senderId !== match.dateAuthorId) {
        interestExpiresAt = null;
      }

      const newMessage: Message = {
        id: Date.now(),
        senderId,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const updatedMessages = [...match.messages, newMessage];
      
      const { error: updateError } = await supabase.from('matches').update({ messages: updatedMessages, interestExpiresAt }).eq('id', matchId);
      if (updateError) throw new Error(updateError.message);

      return newMessage;
  },

  // --- DATES ---
  async getDateIdeas(): Promise<DateIdea[]> {
    const { data, error } = await supabase.from('date_ideas').select('*').order('id', { ascending: false });
    return handleSupabaseError({ data, error }, 'getDateIdeas') || [];
  },
  
  async createDateIdea(newDate: Omit<DateIdea, 'id'>): Promise<DateIdea> {
    const { data, error } = await supabase.from('date_ideas').insert(newDate).select().single();
    return handleSupabaseError({ data, error }, 'createDateIdea');
  },
};