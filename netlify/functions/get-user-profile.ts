import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

// This handler is dual-purpose:
// 1. If called by an authenticated user without a userId query param, it returns their own profile.
// 2. If called with a userId query param, it returns that user's public profile.
const getUserProfileHandler: Handler = async (event, context: AuthContext) => {
  try {
    const specificUserId = event.queryStringParameters?.userId;
    const authenticatedUserId = context.clientContext?.user?.id;
    
    const userIdToFetch = specificUserId || authenticatedUserId;

    if (!userIdToFetch) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID not specified and no user authenticated.' }) };
    }

    const { rows } = await pool.query('SELECT id, name, age, email, phone, bio, images, interests, background, "isPremium" FROM users WHERE id = $1', [userIdToFetch]);
    
    const user = rows[0];

    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ error: 'User not found.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    };

  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};

// We wrap with 'withAuth' to make the authenticated user's ID available if a token is passed,
// but the handler logic allows for public profile fetching too.
export const handler = withAuth(getUserProfileHandler);
