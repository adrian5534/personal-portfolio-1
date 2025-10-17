/* eslint-env node */

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

function trunc(s, n = 500) {
  return String(s || '').slice(0, n);
}

const crypto = require('crypto');

async function getOrCreateCustomer({ email, name, phone, address }) {
  if (!email) return null;
  const list = await stripe.customers.list({ email, limit: 1 });
  const existing = list.data?.[0];
  if (existing) {
    try {
      await stripe.customers.update(existing.id, {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
      });
    } catch (e) {
      console.warn('Stripe customer update skipped:', e?.message || e);
    }
    return existing;
  }
  return await stripe.customers.create({
    email,
    name: name || undefined,
    phone: phone || undefined,
    address: address || undefined,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // Generate a friendly order number (store it so we can show it later)
    const orderNumber =
      body.orderNumber ||
      `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const amount = Math.round(Number(body.amount || 0)); // cents
    const currency = body.currency || 'usd';
    const receipt_email = body.receipt_email || body.email || undefined;
    const monthlyCents = Math.max(Math.round(Number(body.monthlyCents || 0)), 0);

    if (!Number.isFinite(amount) || amount < 50) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid amount' }) };
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }) };
    }

    // Create or update Customer (for subscriptions and receipts)
    const billing = body.billing || {};
    const customer = await getOrCreateCustomer({
      email: receipt_email,
      name: billing.name,
      phone: billing.phone,
      address: {
        line1: billing.address1 || undefined,
        line2: billing.address2 || undefined,
        city: billing.city || undefined,
        state: billing.state || undefined,
        postal_code: billing.postal || undefined,
        country: billing.country || undefined,
      },
    });

    const description = trunc(body.summary || 'Portfolio payment');

    // Metadata must be flat strings; keep JSON compact
    const metadata = {
      ...(body.metadata || {}),
      subtotalCents: String(body.subtotalCents ?? ''),
      taxCents: String(body.taxCents ?? ''),
      totalCents: String(body.totalCents ?? amount),
      monthlyCents: String(monthlyCents),
      lineItems: trunc(JSON.stringify(body.lineItems || [])), // <= 500 chars
      orderNumber,
      // Optionally serialize lineItems so confirmation page can render them
      ...(Array.isArray(body.lineItems) ? { lineItems: JSON.stringify(body.lineItems) } : {}),
    };

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email,
      description,
      automatic_payment_methods: { enabled: true },
      customer: customer?.id,
      // Save card if monthly is selected (used later for subscription)
      setup_future_usage: monthlyCents > 0 ? 'off_session' : undefined,
      metadata,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: intent.client_secret, customerId: customer?.id || null, orderNumber }),
    };
  } catch (err) {
    console.error('create-payment-intent error', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};