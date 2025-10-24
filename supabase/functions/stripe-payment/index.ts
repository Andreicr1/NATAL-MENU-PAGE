// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import Stripe from "npm:stripe@17.4.0";

const app = new Hono();

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-10-28.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400,
  credentials: true,
}));

// Handle OPTIONS preflight requests
app.options("/*", (c) => {
  return c.text("", 204);
});

// Health check
app.get("/stripe-c42493b2/health", (c) => {
  return c.json({ status: "ok", service: "stripe-integration" });
});

// Sync product to Stripe
app.post("/stripe-c42493b2/sync-product", async (c) => {
  try {
    const { id, name, description, price, image } = await c.req.json();

    // Check if product exists in Stripe
    const existingProducts = await stripe.products.search({
      query: `metadata['local_id']:'${id}'`,
    });

    let product;
    if (existingProducts.data.length > 0) {
      // Update existing product
      product = await stripe.products.update(existingProducts.data[0].id, {
        name,
        description,
        images: image ? [image] : undefined,
        metadata: {
          local_id: id,
        },
      });
    } else {
      // Create new product
      product = await stripe.products.create({
        name,
        description,
        images: image ? [image] : undefined,
        metadata: {
          local_id: id,
        },
      });
    }

    // Create or update price
    const priceAmount = Math.round(parseFloat(price) * 100); // Convert to cents
    
    // Create new price (Stripe doesn't allow updating prices)
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount,
      currency: 'brl',
      metadata: {
        local_id: id,
      },
    });

    // Update product with default price
    await stripe.products.update(product.id, {
      default_price: priceObj.id,
    });

    return c.json({
      success: true,
      product: {
        id: product.id,
        price_id: priceObj.id,
        local_id: id,
      },
    });
  } catch (error) {
    console.error("Error syncing product:", error);
    return c.json({ 
      error: "Failed to sync product", 
      details: error.message 
    }, 500);
  }
});

// Create checkout session
app.post("/stripe-c42493b2/create-checkout-session", async (c) => {
  try {
    const { items, customerEmail, successUrl, cancelUrl } = await c.req.json();

    if (!items || items.length === 0) {
      return c.json({ error: "No items provided" }, 400);
    }

    // Prepare line items for Stripe
    const lineItems = await Promise.all(
      items.map(async (item: any) => {
        // Search for product by local_id
        const products = await stripe.products.search({
          query: `metadata['local_id']:'${item.id}'`,
        });

        if (products.data.length === 0) {
          throw new Error(`Product not found in Stripe: ${item.name}`);
        }

        const product = products.data[0];
        const priceId = product.default_price as string;

        return {
          price: priceId,
          quantity: item.quantity,
        };
      })
    );

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${c.req.header('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${c.req.header('origin')}/`,
      customer_email: customerEmail,
      locale: 'pt-BR',
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        items: JSON.stringify(items.map((i: any) => ({ id: i.id, quantity: i.quantity }))),
      },
    });

    return c.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return c.json({ 
      error: "Failed to create checkout session", 
      details: error.message 
    }, 500);
  }
});

// Create payment intent (for custom checkout flow)
app.post("/stripe-c42493b2/create-payment-intent", async (c) => {
  try {
    const { amount, currency = 'brl', customerEmail, metadata } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      metadata: metadata || {},
    });

    return c.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return c.json({ 
      error: "Failed to create payment intent", 
      details: error.message 
    }, 500);
  }
});

// Webhook handler
app.post("/stripe-c42493b2/webhook", async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return c.json({ error: "Missing signature or webhook secret" }, 400);
    }

    const body = await c.req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return c.json({ error: 'Invalid signature' }, 400);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Payment successful:', session.id);
        console.log('Customer email:', session.customer_email);
        console.log('Amount total:', session.amount_total);
        console.log('Items:', session.metadata?.items);
        
        // Here you can:
        // - Send confirmation email
        // - Update order status in database
        // - Trigger fulfillment process
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', paymentIntent.id);
        console.log('Amount:', paymentIntent.amount);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id);
        console.error('Error:', paymentIntent.last_payment_error?.message);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Charge refunded:', charge.id);
        console.log('Amount refunded:', charge.amount_refunded);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ 
      error: "Webhook handler failed", 
      details: error.message 
    }, 500);
  }
});

// Get checkout session details
app.get("/stripe-c42493b2/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return c.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return c.json({ 
      error: "Failed to retrieve session", 
      details: error.message 
    }, 500);
  }
});

// List all products in Stripe
app.get("/stripe-c42493b2/products", async (c) => {
  try {
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: product.metadata,
          default_price: prices.data[0],
        };
      })
    );

    return c.json({
      success: true,
      products: productsWithPrices,
    });
  } catch (error) {
    console.error("Error listing products:", error);
    return c.json({ 
      error: "Failed to list products", 
      details: error.message 
    }, 500);
  }
});

// Create refund
app.post("/stripe-c42493b2/refund", async (c) => {
  try {
    const { paymentIntentId, amount, reason } = await c.req.json();

    if (!paymentIntentId) {
      return c.json({ error: "Payment intent ID required" }, 400);
    }

    const refundParams: any = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    return c.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("Error creating refund:", error);
    return c.json({ 
      error: "Failed to create refund", 
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);
