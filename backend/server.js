const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

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

// In-memory storage for testing
let dateIdeas = [];
let users = [
  { id: 1, name: 'Alex', age: 29, email: 'demo@user.com', password: 'password' },
  { id: 2, name: 'Chloe', age: 28, email: 'chloe@email.com', password: 'password123' }
];
let currentUserId = 3;

// Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ user: { ...user, password: undefined }, token });
});

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  const newUser = {
    id: currentUserId++,
    name,
    email,
    password,
    age: 18,
    bio: '',
    images: '[]',
    interests: '[]'
  };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
  res.json({ user: { ...newUser, password: undefined }, token });
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

app.get('/api/date-ideas', authenticateToken, (req, res) => {
  res.json(dateIdeas);
});

app.post('/api/date-ideas', authenticateToken, (req, res) => {
  const { title, description, category, location, date, budget, dressCode } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newDateIdea = {
    id: Date.now(),
    title,
    description,
    category,
    authorId: req.user.id,
    authorName: user.name,
    authorImage: user.images ? JSON.parse(user.images)[0] : null,
    location,
    date,
    budget,
    dressCode,
    created_at: new Date().toISOString()
  };

  dateIdeas.push(newDateIdea);
  res.json(newDateIdea);
});

app.get('/api/premium-status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT is_premium, expires_at FROM "UserPremium" WHERE user_id = $1', [req.user.id]);
    const premium = result.rows[0] || { is_premium: false, expires_at: null };
    res.json(premium);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/upgrade-premium', authenticateToken, async (req, res) => {
  const { paymentId, expiresAt } = req.body; // Adjust based on PayPal response
  try {
    await pool.query(`
      INSERT INTO "UserPremium" (user_id, is_premium, expires_at) 
      VALUES ($1, true, $2) 
      ON CONFLICT (user_id) DO UPDATE SET is_premium = true, expires_at = $2
    `, [req.user.id, expiresAt]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/check-match', authenticateToken, async (req, res) => {
  const { swipedUserId } = req.body;
  try {
    // Check if the other user liked back
    const result = await pool.query(`
      SELECT 1 FROM "Swipes" 
      WHERE user_id = $1 AND swiped_user_id = $2 AND action = 'like'
    `, [swipedUserId, req.user.id]);
    const isLikedBack = result.rows.length > 0;
    if (isLikedBack) {
      // Create match
      await pool.query(`
        INSERT INTO "Matches" (user1_id, user2_id) 
        VALUES (LEAST($1, $2), GREATEST($1, $2)) 
        ON CONFLICT DO NOTHING
      `, [req.user.id, swipedUserId]);
    }
    res.json({ isMatch: isLikedBack });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/matches', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, u.id as userId, u.name, u.age, u.bio, u.images, u.interests
      FROM "Matches" m
      JOIN "Users" u ON (u.id = m.user1_id OR u.id = m.user2_id) AND u.id != $1
      WHERE m.user1_id = $1 OR m.user2_id = $1
      ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/messages/:matchId', authenticateToken, async (req, res) => {
  const { matchId } = req.params;
  try {
    // Verify user is in the match
    const matchCheck = await pool.query(`
      SELECT 1 FROM "Matches" 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [matchId, req.user.id]);
    if (matchCheck.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await pool.query(`
      SELECT m.id, m.sender_id, m.text, m.timestamp, u.name as senderName
      FROM "Messages" m
      JOIN "Users" u ON u.id = m.sender_id
      WHERE m.match_id = $1
      ORDER BY m.timestamp ASC
    `, [matchId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/messages/:matchId', authenticateToken, async (req, res) => {
  const { matchId } = req.params;
  const { text } = req.body;
  try {
    // Verify user is in the match
    const matchCheck = await pool.query(`
      SELECT 1 FROM "Matches" 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [matchId, req.user.id]);
    if (matchCheck.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await pool.query(`
      INSERT INTO "Messages" (match_id, sender_id, text) 
      VALUES ($1, $2, $3) 
      RETURNING id, sender_id, text, timestamp
    `, [matchId, req.user.id, text]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
