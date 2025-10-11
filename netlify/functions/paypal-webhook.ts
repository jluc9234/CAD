import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';
import { pool } from './utils/db';
// FIX: Added import for Buffer to resolve TypeScript error in Node.js environment.
import { Buffer } from 'buffer';

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: {
    custom_id: string;
  }[];
}

async function verifyPayPalWebhook(event: any): Promise<boolean> {
  const { headers, body } = event;
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!paypalClientId || !paypalClientSecret || !webhookId) {
    console.error('Missing PayPal credentials in environment.');
    return false;
  }
  
  try {
    const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64');
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', { // Use api-m.paypal.com for production
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    const verificationResponse = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', { // Use api-m.paypal.com for production
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    const verificationJson = await verificationResponse.json();
    return verificationJson.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('Error verifying PayPal webhook:', err);
    return false;
  }
}

export const handler: Handler = async (event) => {
  try {
    const isVerified = await verifyPayPalWebhook(event);

    if (!isVerified) {
      console.warn('Could not verify PayPal webhook signature.');
      return { statusCode: 403, body: 'Forbidden: Invalid signature' };
    }

    const webhookEvent = JSON.parse(event.body!);

    if (webhookEvent.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const order = webhookEvent.resource as PayPalOrder;
      const userId = order.purchase_units?.[0]?.custom_id;

      if (!userId) {
        console.error('Webhook received, but no userId found in custom_id.');
        return { statusCode: 400, body: 'Bad Request: Missing userId' };
      }

      // Update user profile in Neon DB
      await pool.query('UPDATE users SET "isPremium" = true WHERE id = $1', [userId]);
      console.log(`Successfully upgraded user ${userId} to premium.`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Error processing webhook:', err);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }
};
