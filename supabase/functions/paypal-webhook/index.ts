// FIX: Corrected the import to use a full URL as required by the Deno runtime for Supabase Edge Functions.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// FIX: Add type declaration for Deno to resolve TypeScript errors in environments
// where Deno types are not automatically available. This allows standard
// TypeScript tooling to understand Deno-specific globals.
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => unknown;
};

// Define the structure of the PayPal order response for typing
interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: {
    custom_id: string; // This is where we will pass the user's ID
  }[];
}

// Function to verify the webhook signature with PayPal's API
async function verifyPayPalWebhook(req: Request, paypalClientId: string, paypalClientSecret: string): Promise<boolean> {
  const body = await req.clone().text(); // Clone the request to read the body
  const headers = req.headers;
  
  const authAlgo = headers.get('paypal-auth-algo');
  const certUrl = headers.get('paypal-cert-url');
  const transmissionId = headers.get('paypal-transmission-id');
  const transmissionSig = headers.get('paypal-transmission-sig');
  const transmissionTime = headers.get('paypal-transmission-time');
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID'); // Your webhook ID from PayPal dashboard

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime || !webhookId) {
    console.error('Missing PayPal webhook headers');
    return false;
  }
  
  // Get an access token from PayPal
  const auth = btoa(`${paypalClientId}:${paypalClientSecret}`);
  const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    console.error('Failed to get PayPal access token');
    return false;
  }
  const { access_token } = await tokenResponse.json();

  // Verify the webhook signature
  const verificationResponse = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });
  
  const verificationJson = await verificationResponse.json();
  return verificationJson.verification_status === 'SUCCESS';
}


Deno.serve(async (req) => {
  // Only process POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // --- Environment Variables ---
  // These must be set in your Supabase project's environment variables
  const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  // CORRECTED: Using default Supabase-provided environment variables.
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!paypalClientId || !paypalClientSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables.');
    return new Response('Internal Server Error: Configuration missing', { status: 500 });
  }
  
  try {
    // --- 1. Verify the webhook is actually from PayPal ---
    const isVerified = await verifyPayPalWebhook(req, paypalClientId, paypalClientSecret);
    if (!isVerified) {
      console.warn('Could not verify PayPal webhook signature.');
      return new Response('Forbidden: Invalid signature', { status: 403 });
    }

    // --- 2. Process the webhook event ---
    const event = await req.json();

    // We only care about completed checkouts
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const order = event.resource as PayPalOrder;
      
      // The user's ID was attached to the 'custom_id' field on the client
      const userId = order.purchase_units?.[0]?.custom_id;
      
      if (!userId) {
        console.error('Webhook received, but no userId found in custom_id.');
        return new Response('Bad Request: Missing userId', { status: 400 });
      }

      // --- 3. Update the user's profile in Supabase ---
      // IMPORTANT: Create a Supabase client with the 'service_role' key.
      // This is required to bypass Row Level Security and update any user's profile.
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      
      const { error } = await supabaseAdmin
        .from('users')
        .update({ isPremium: true })
        .eq('id', userId);

      if (error) {
        console.error(`Failed to update user ${userId} to premium:`, error.message);
        // We still return 200 to PayPal so it doesn't keep retrying. The error is logged.
      } else {
        console.log(`Successfully upgraded user ${userId} to premium.`);
      }
    }

    // --- 4. Acknowledge receipt to PayPal ---
    // Always return a 200 OK to PayPal to prevent them from resending the webhook.
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Error processing webhook:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});