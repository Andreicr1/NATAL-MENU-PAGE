// Stripe API utilities for product synchronization and payment management

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mypdmnucmkigqshafrwx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGRtbnVjbWtpZ3FzaGFmcnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTAxNzMsImV4cCI6MjA3NjM4NjE3M30.LTzyrfI4unf-KkhRktZyEQCPUoWphpWAo4U0kQ2Y5u8';
const STRIPE_API_BASE = `${SUPABASE_URL}/functions/v1/stripe-c42493b2`;

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
}

interface StripeProduct {
  id: string;
  price_id: string;
  local_id: string;
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Sync a single product to Stripe
 * Creates or updates the product and its price in Stripe
 */
export async function syncProductToStripe(product: Product): Promise<StripeProduct | null> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}/sync-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.priceValue.toString(),
        image: product.image,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to sync product to Stripe:', errorText);
      return null;
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error syncing product to Stripe:', error);
    return null;
  }
}

/**
 * Sync multiple products to Stripe
 * Useful for initial setup or bulk updates
 */
export async function syncMultipleProductsToStripe(products: Product[]): Promise<{
  success: number;
  failed: number;
  results: Array<{ product: Product; stripeProduct: StripeProduct | null }>;
}> {
  const results = await Promise.all(
    products.map(async (product) => ({
      product,
      stripeProduct: await syncProductToStripe(product),
    }))
  );

  const success = results.filter(r => r.stripeProduct !== null).length;
  const failed = results.length - success;

  return { success, failed, results };
}

/**
 * Create a Stripe Checkout Session
 * Redirects user to Stripe's hosted checkout page
 */
export async function createCheckoutSession(
  items: Array<{ id: string; name: string; quantity: number; price: number }>,
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutSession | null> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        items,
        customerEmail,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create checkout session:', errorText);
      return null;
    }

    const data = await response.json();
    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Create a Payment Intent for custom checkout flow
 * Returns client secret to be used with Stripe Elements
 */
export async function createPaymentIntent(
  amount: number,
  customerEmail?: string,
  metadata?: Record<string, string>
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'brl',
        customerEmail,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create payment intent:', errorText);
      return null;
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

/**
 * Get checkout session details
 * Useful for confirming payment status after redirect
 */
export async function getCheckoutSession(sessionId: string): Promise<any | null> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}/session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to retrieve session');
      return null;
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
}

/**
 * List all products in Stripe
 */
export async function listStripeProducts(): Promise<any[]> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to list products');
      return [];
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error listing products:', error);
    return [];
  }
}

/**
 * Create a refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<any | null> {
  try {
    const response = await fetch(`${STRIPE_API_BASE}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
        reason,
      }),
    });

    if (!response.ok) {
      console.error('Failed to create refund');
      return null;
    }

    const data = await response.json();
    return data.refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    return null;
  }
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return !!publishableKey && publishableKey.length > 0;
}

/**
 * Helper to format cart items for Stripe checkout
 */
export function formatCartItemsForStripe(cart: Array<{
  id: string;
  name: string;
  quantity: number;
  priceValue: number;
}>): Array<{ id: string; name: string; quantity: number; price: number }> {
  return cart.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.priceValue,
  }));
}
