import { Handler } from '@netlify/functions';
import { pool } from './utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, pass } = JSON.parse(event.body!);
    if (!name || !email || !pass) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name, email, and password are required.' }) };
    }
    
    const { rows: existingUsers } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ error: 'User with this email already exists.' }) };
    }
    
    const hashedPassword = await bcrypt.hash(pass, 10);
    const id = crypto.randomUUID();

    const newUserProfile = {
        id,
        name,
        email,
        password: hashedPassword,
        age: 18,
        bio: '',
        images: [`https://picsum.photos/seed/${id}/800/1200`],
        interests: [],
        isPremium: false,
    };
    
    const { rows } = await pool.query(
        `INSERT INTO users(id, name, email, password, age, bio, images, interests, "isPremium") 
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email`,
        [newUserProfile.id, newUserProfile.name, newUserProfile.email, newUserProfile.password, newUserProfile.age, newUserProfile.bio, newUserProfile.images, newUserProfile.interests, newUserProfile.isPremium]
    );

    const newUser = rows[0];

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable not set.');
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};
