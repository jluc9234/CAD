import { User, DateIdea, Match, Message } from '../types';

const API_PREFIX = '/.netlify/functions';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_PREFIX}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status: ${response.status}` }));
        throw new Error(errorData.error || 'An API error occurred.');
    }

    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  } catch (err) {
    console.error(`API call to ${endpoint} failed:`, err);
    throw err;
  }
}

export const apiService = {
  // --- AUTH ---
  async getUserProfile(userId: string): Promise<User | null> {
    return apiFetch(`/get-user-profile?userId=${userId}`);
  },

  async getCurrentUserProfile(): Promise<User | null> {
    return apiFetch('/get-user-profile');
  },
  
  async login(email: string, pass: string): Promise<{ token: string }> {
    const result = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, pass }),
    });
    if (result.token) {
        localStorage.setItem('authToken', result.token);
    }
    return result;
  },

  async signup(name: string, email: string, pass: string): Promise<{ token: string }> {
     const result = await apiFetch('/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, pass }),
    });
    if (result.token) {
        localStorage.setItem('authToken', result.token);
    }
    return result;
  },
  
  logout(): void {
    localStorage.removeItem('authToken');
  },

  async updateUser(updatedUser: User): Promise<User> {
    return apiFetch('/update-user', {
        method: 'PUT',
        body: JSON.stringify(updatedUser)
    });
  },

  // --- SWIPING ---
  async getUsersToSwipe(currentUserId: string): Promise<User[]> {
    return apiFetch(`/get-users-to-swipe`);
  },
  
  // --- MATCHES & CHAT ---
  async getMatches(currentUserId: string): Promise<Match[]> {
    return apiFetch(`/get-matches`);
  },

  async addMatch(currentUserId: string, targetUserId: string): Promise<void> {
    return apiFetch('/add-match', {
        method: 'POST',
        body: JSON.stringify({ targetUserId }),
    });
  },

  async createDateInterestMatch(currentUserId: string, dateIdea: DateIdea): Promise<void> {
    return apiFetch('/create-date-interest-match', {
        method: 'POST',
        body: JSON.stringify({ dateIdea }),
    });
  },

  async removeMatch(matchId: number): Promise<void> {
    return apiFetch(`/remove-match`, {
      method: 'DELETE',
      body: JSON.stringify({ matchId })
    });
  },
  
  async sendMessage(matchId: number, senderId: string, text: string): Promise<Message> {
      return apiFetch('/send-message', {
          method: 'POST',
          body: JSON.stringify({ matchId, text }),
      });
  },

  // --- DATES ---
  async getDateIdeas(): Promise<DateIdea[]> {
    return apiFetch('/get-date-ideas');
  },
  
  async createDateIdea(newDate: Omit<DateIdea, 'id'>): Promise<DateIdea> {
    return apiFetch('/create-date-idea', {
        method: 'POST',
        body: JSON.stringify(newDate),
    });
  },
};