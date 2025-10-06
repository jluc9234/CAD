const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const schemaPath = path.join(__dirname, 'db', 'schema.sql');

async function setupDB() {
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema applied successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    pool.end();
  }
}

setupDB();
