import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const addMatchHandler: Handler = async (event, context: AuthContext) => {
  try {
    const likerId = context.clientContext.user!.id;
    const { targetUserId } = JSON.parse(event.body!);
    
    if (!targetUserId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'targetUserId is required.' }) };
    }

    // This function now handles right swipes and checks for mutual likes.
    // It assumes a 'likes' table exists with columns: liker_id (text), liked_id (text), and a primary key on (liker_id, liked_id).

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Record the new "like".
        // Using ON CONFLICT to prevent duplicate entries if a user swipes right multiple times.
        await client.query(
            'INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) ON CONFLICT (liker_id, liked_id) DO NOTHING',
            [likerId, targetUserId]
        );

        // Step 2: Check if the other user has already liked the current user.
        const { rows } = await client.query(
            'SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2',
            [targetUserId, likerId]
        );

        if (rows.length > 0) {
            // It's a mutual like! Create a match.
            // Check if a match doesn't already exist to be safe.
            const { rows: existingMatch } = await client.query(
                `SELECT 1 FROM matches WHERE participants @> ARRAY[$1::text, $2::text]`,
                [likerId, targetUserId]
            );

            if (existingMatch.length === 0) {
                await client.query(
                    `INSERT INTO matches(participants, "interestType", messages) VALUES($1, 'swipe', '[]')`,
                    [[likerId, targetUserId]]
                );
            }
            
            await client.query('COMMIT');
            
            // Return that a match was made.
            return {
                statusCode: 201, // 201 Created (the match)
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matched: true, message: 'It\'s a match!' }),
            };
        } else {
            // Not a mutual like yet.
            await client.query('COMMIT');
            return {
                statusCode: 200, // 200 OK
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matched: false, message: 'Like recorded.' }),
            };
        }
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

  } catch (error) {
    console.error('Error in add-match (swipe right) handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process swipe.' }),
    };
  }
};

export const handler = withAuth(addMatchHandler);