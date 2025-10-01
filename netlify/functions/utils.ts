import { Pool } from 'pg';
import type { Handler, HandlerResponse } from "@netlify/functions";

// Create a single, reusable connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A wrapper to handle common logic for API functions
export const createApiHandler = (handler: Handler): Handler => {
  return async (event, context) => {
    try {
      const response = await handler(event, context);
      return {
        ...response,
        headers: {
          ...response?.headers,
          'Content-Type': 'application/json',
        },
      } as HandlerResponse;
    } catch (error) {
      console.error('API Handler Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: error instanceof Error ? error.message : 'An internal server error occurred.' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  };
};

export { pool };
