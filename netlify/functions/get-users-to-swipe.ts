import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const getUsersToSwipeHandler: Handler = async (event, context: AuthContext) => {
  try {
    const currentUserId = context.clientContext.user!.id;
    // In a real app, you'd also exclude users you've already swiped on/matched with.
    // For this migration, we'll keep the simple logic.
    const { rows } = await pool.query('SELECT id, name, age, email, phone, bio, images, interests, background, "isPremium" FROM users WHERE id != $1', [currentUserId]);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error('Error fetching users to swipe:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch users.' }),
    };
  }
};

export const handler = withAuth(getUsersToSwipeHandler);
