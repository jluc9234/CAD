import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';

const updateUserHandler: Handler = async (event, context: AuthContext) => {
  try {
    const authenticatedUserId = context.clientContext.user!.id;
    const { id, ...updateData } = JSON.parse(event.body!);
    
    if (id !== authenticatedUserId) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: You can only update your own profile.' }) };
    }
    
    // Sanitize data - never update email, password, or premium status from this endpoint
    delete updateData.email;
    delete updateData.password;
    delete updateData.isPremium;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');

    if (fields.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No fields to update.' }) };
    }

    const query = `
      UPDATE users
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, name, age, email, phone, bio, images, interests, background, "isPremium";
    `;
    
    const { rows } = await pool.query(query, [...values, id]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows[0]),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update user.' }),
    };
  }
};

export const handler = withAuth(updateUserHandler);
