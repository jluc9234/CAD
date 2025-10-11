import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const createDateIdeaHandler: Handler = async (event, context: AuthContext) => {
  try {
    const newDate = JSON.parse(event.body!);
    const user = context.clientContext.user!;

    // Ensure the authorId matches the authenticated user to prevent spoofing
    if (newDate.authorId !== user.id) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: Author ID does not match authenticated user.' }) };
    }

    const { title, description, category, authorId, authorName, authorImage, location, isOutOfTown, date, budget, dressCode } = newDate;

    const query = `
      INSERT INTO date_ideas(title, description, category, "authorId", "authorName", "authorImage", location, "isOutOfTown", date, budget, "dressCode")
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [title, description, category, authorId, authorName, authorImage, location, isOutOfTown, date, budget, dressCode];

    const { rows } = await pool.query(query, values);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows[0]),
    };
  } catch (error) {
    console.error('Error creating date idea:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create date idea.' }),
    };
  }
};

export const handler = withAuth(createDateIdeaHandler);
