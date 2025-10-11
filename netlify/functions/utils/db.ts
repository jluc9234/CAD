import { Pool } from 'pg';

// This setup ensures that the connection pool is created only once
// and reused across function invocations.
let pool: Pool;

if (!pool) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export { pool };
