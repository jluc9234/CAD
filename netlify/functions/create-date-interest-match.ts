import { Handler } from '@netlify/functions';
import { withAuth, AuthContext } from './utils/auth';
import { pool } from './utils/db';
import { DateIdea } from '../../types';

const createDateInterestMatchHandler: Handler = async (event, context: AuthContext) => {
  try {
    const currentUserId = context.clientContext.user!.id;
    const { dateIdea } = JSON.parse(event.body!) as { dateIdea: DateIdea };

    if (!dateIdea) {
        return { statusCode: 400, body: JSON.stringify({ error: 'dateIdea is required.' }) };
    }

    const newMatchData = {
      participants: [currentUserId, dateIdea.authorId],
      interestType: 'date',
      interestExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      dateIdeaId: dateIdea.id,
      dateAuthorId: dateIdea.authorId,
      messages: [],
    };
    
    const query = `
      INSERT INTO matches(participants, "interestType", "interestExpiresAt", "dateIdeaId", "dateAuthorId", messages)
      VALUES($1, $2, $3, $4, $5, $6)
    `;
    const values = [newMatchData.participants, newMatchData.interestType, newMatchData.interestExpiresAt, newMatchData.dateIdeaId, newMatchData.dateAuthorId, JSON.stringify(newMatchData.messages)];

    await pool.query(query, values);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Date interest match created successfully.' }),
    };
  } catch (error) {
    console.error('Error creating date interest match:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create match.' }),
    };
  }
};

export const handler = withAuth(createDateInterestMatchHandler);
