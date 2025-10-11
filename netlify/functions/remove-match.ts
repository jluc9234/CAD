import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const removeMatchHandler: Handler = async (event, context: AuthContext) => {
  try {
    const currentUserId = context.clientContext.user!.id;
    const { matchId } = JSON.parse(event.body!);

    if (!matchId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'matchId is required.' }) };
    }

    // Ensure the user is part of the match they are trying to delete
    const { rows } = await pool.query('SELECT participants FROM matches WHERE id = $1', [matchId]);
    if (rows.length === 0 || !rows[0].participants.includes(currentUserId)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: You are not part of this match.' }) };
    }

    await pool.query('DELETE FROM matches WHERE id = $1', [matchId]);

    return {
      statusCode: 204, // No Content
    };
  } catch (error) {
    console.error('Error removing match:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to remove match.' }),
    };
  }
};

export const handler = withAuth(removeMatchHandler);
