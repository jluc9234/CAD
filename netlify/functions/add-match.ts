import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const addMatchHandler: Handler = async (event, context: AuthContext) => {
  try {
    const currentUserId = context.clientContext.user!.id;
    const { targetUserId } = JSON.parse(event.body!);
    
    if (!targetUserId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'targetUserId is required.' }) };
    }

    const query = `
      INSERT INTO matches(participants, "interestType", messages)
      VALUES($1, 'swipe', '[]')
    `;
    const values = [[currentUserId, targetUserId]];
    
    await pool.query(query, values);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Match created successfully.' }),
    };
  } catch (error) {
    console.error('Error adding match:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to add match.' }),
    };
  }
};

export const handler = withAuth(addMatchHandler);
