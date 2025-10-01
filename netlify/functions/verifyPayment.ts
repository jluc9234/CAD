import type { Handler } from '@netlify/functions';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Use sandbox for testing: https://api-m.sandbox.paypal.com

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

async function verifyOrder(orderID: string, accessToken: string) {
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return data.status === 'COMPLETED';
}

export const handler: Handler = async (event) => {
  try {
    const { orderID } = JSON.parse(event.body || '{}');
    if (!orderID) return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Missing order ID' }) };

    const token = await getAccessToken();
    const success = await verifyOrder(orderID, token);

    return {
      statusCode: 200,
      body: JSON.stringify({ success }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Server error' }),
    };
  }
};
