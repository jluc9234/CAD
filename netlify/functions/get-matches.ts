import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';
import { Match, MatchData, User } from '../../types'; // Assuming types can be imported

export const getMatchesHandler: Handler = async (event, context: AuthContext) => {
  try {
    const currentUserId = context.clientContext.user!.id;

    // Fetch matches where the current user is a participant
    const { rows: matchesData } = await pool.query<MatchData>('SELECT * FROM matches WHERE $1 = ANY(participants)', [currentUserId]);
    
    if (!matchesData || matchesData.length === 0) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) };
    }
    
    // Get the IDs of the other users in the matches
    const otherUserIds = matchesData.map(m => m.participants.find(pId => pId !== currentUserId)).filter(Boolean) as string[];
    if (otherUserIds.length === 0) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) };
    }
    
    // Fetch the profiles of those other users
    const { rows: usersData } = await pool.query<User>('SELECT id, name, age, email, phone, bio, images, interests, background, "isPremium" FROM users WHERE id = ANY($1::text[])', [otherUserIds]);
    
    const usersById = new Map(usersData.map(u => [u.id, u]));

    // Combine match data with user profiles
    const result: Match[] = matchesData.map((matchData) => {
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
    }).sort((a, b) => b.id - a.id);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch matches.' }),
    };
  }
};

export const handler = withAuth(getMatchesHandler);
