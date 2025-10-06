const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = result.rows[0];
    const isValidPassword = user.password === password;
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ user: { ...user, password: undefined }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    const result = await pool.query(
      'INSERT INTO "Users" (name, email, password, age, bio, images, interests) VALUES ($1, $2, $3, 18, \'\', ARRAY[]::TEXT[], ARRAY[]::TEXT[]) RETURNING *',
      [name, email, password]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ user: { ...user, password: undefined }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/user/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (req.user.id != id) return res.sendStatus(403);
  try {
    const result = await pool.query('SELECT * FROM "Users" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    res.json({ ...user, password: undefined });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, age, bio, images, interests 
      FROM "Users" 
      WHERE id != $1 
      AND id NOT IN (
        SELECT swiped_user_id FROM "Swipes" WHERE user_id = $1
      )
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/swipe', authenticateToken, async (req, res) => {
  const { swipedUserId, action } = req.body;
  try {
    await pool.query(`
      INSERT INTO "Swipes" (user_id, swiped_user_id, action) 
      VALUES ($1, $2, $3)
    `, [req.user.id, swipedUserId, action]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/date-ideas', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "DateIdeas" ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/date-ideas', authenticateToken, async (req, res) => {
  const { title, description, category, location, date, budget, dressCode } = req.body;
  try {
    const userResult = await pool.query('SELECT name, images FROM "Users" WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    const result = await pool.query(`
      INSERT INTO "DateIdeas" (title, description, category, authorId, authorName, authorImage, location, date, budget, dressCode) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `, [title, description, category, req.user.id, user.name, user.images[0], location, date, budget, dressCode]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
