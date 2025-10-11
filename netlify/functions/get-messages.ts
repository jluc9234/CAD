import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const getMessagesHandler: Handler = async (event, context: AuthContext) => {
  try {
    const currentUserId = context.clientContext.user!.id;
    const { matchId } = event.queryStringParameters;

    if (!matchId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'matchId is required.' }) };
    }

    const { rows } = await pool.query(
        'SELECT messages, participants FROM matches WHERE id = $1',
        [matchId]
    );
    const match = rows[0];

    if (!match || !match.participants.includes(currentUserId)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: You are not part of this match.' }) };
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match.messages || []),
    };

  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch messages.' }),
    };
  }
};

export const handler = withAuth(getMessagesHandler);
