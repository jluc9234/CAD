import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';
import { Message, MatchData } from '../../types';

const sendMessageHandler: Handler = async (event, context: AuthContext) => {
  try {
    const senderId = context.clientContext.user!.id;
    const { matchId, text } = JSON.parse(event.body!);

    if (!matchId || !text) {
        return { statusCode: 400, body: JSON.stringify({ error: 'matchId and text are required.' }) };
    }

    // Fetch the match to ensure the user is a participant
    const { rows: matchRows } = await pool.query<MatchData>('SELECT * FROM matches WHERE id = $1', [matchId]);
    const match = matchRows[0];
    
    if (!match || !match.participants.includes(senderId)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: You are not part of this match.' }) };
    }
    
    const isExpired = match.interestExpiresAt && new Date(match.interestExpiresAt) < new Date();
    let interestExpiresAt = match.interestExpiresAt;

    // Logic to nullify expiry date after response
    if (match.interestType === 'date' && isExpired && senderId !== match.dateAuthorId) {
      interestExpiresAt = null;
    }
    
    const newMessage: Message = {
      id: Date.now(),
      senderId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...match.messages, newMessage];

    await pool.query(
      'UPDATE matches SET messages = $1, "interestExpiresAt" = $2 WHERE id = $3',
      [JSON.stringify(updatedMessages), interestExpiresAt, matchId]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    };

  } catch (error) {
    console.error('Error sending message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message.' }),
    };
  }
};

export const handler = withAuth(sendMessageHandler);
