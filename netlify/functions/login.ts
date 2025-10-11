import { Handler } from '@netlify/functions';
import { pool } from './utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, pass } = JSON.parse(event.body!);
    if (!email || !pass) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and password are required.' }) };
    }
    
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};
