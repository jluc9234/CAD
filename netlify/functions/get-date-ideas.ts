import { Handler } from '@netlify/functions';
import { pool } from './utils/db';

export const handler: Handler = async (event, context) => {
  try {
    const { rows } = await pool.query('SELECT * FROM date_ideas ORDER BY id DESC');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error('Error fetching date ideas:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch date ideas.' }),
    };
  }
};
