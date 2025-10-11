import { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

export interface AuthContext extends HandlerContext {
  clientContext: {
    user?: { id: string; email: string; iat: number; exp: number };
  };
}

export const withAuth = (handler: Handler<HandlerEvent, AuthContext>): Handler<HandlerEvent, AuthContext> => {
  return async (event: HandlerEvent, context: AuthContext) => {
    const authHeader = event.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: No token provided' }) };
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable not set.');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      context.clientContext = { ...context.clientContext, user: decoded as any };
      return handler(event, context);
    } catch (error) {
      return { statusCode: 401, body: JSON.stringify({ error: `Unauthorized: ${error.message}` }) };
    }
  };
};
