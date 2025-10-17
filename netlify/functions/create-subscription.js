/* eslint-env node */
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Prefer env, fallback to provided IDs
const PRICE_BASIC = process.env.STRIPE_PRICE_BASIC || 'price_1SJ5LNBQNwcJUZaoh3AxAbGj';         // $100/mo
const PRICE_OPTIMIZATION = process.env.STRIPE_PRICE_OPTIMIZATION || 'price_1SJ5LNBQNwcJUZaomIxZSsto'; // $200/mo
const PRICE_MAINTENANCE = process.env.STRIPE_PRICE_MAINTENANCE || 'price_1SJ5LNBQNwcJUZaoNqsJYq31';  // $300/mo
const PRODUCT_MONTHLY = process.env.STRIPE_MONTHLY_PRODUCT_ID || 'prod_TFaWQP5GbOnMDh';

function normalizePlanName(s = '') {
  const n = String(s).toLowerCase();
  if (n.includes('basic')) return 'basic';
  if (n.includes('optimization') || n.includes('optimisation')) return 'optimization';
  if (n.includes('maintenance')) return 'maintenance';
  return '';
}

function pickPriceId(planName, monthlyCents) {
  const norm = normalizePlanName(planName);
  if (norm === 'basic') return PRICE_BASIC;
  if (norm === 'optimization') return PRICE_OPTIMIZATION;
  if (norm === 'maintenance') return PRICE_MAINTENANCE;

  // Fallback by amount
  if (monthlyCents === 10000) return PRICE_BASIC;
  if (monthlyCents === 20000) return PRICE_OPTIMIZATION;
  if (monthlyCents === 30000) return PRICE_MAINTENANCE;
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const customerId = String(body.customerId || '').trim();
    const paymentIntentId = String(body.paymentIntentId || '').trim();
    const monthlyCents = Math.max(Math.round(Number(body.monthlyCents || 0)), 0);
    const currency = (body.currency || 'usd').toLowerCase();
    const planName = String(body.plan || 'Monthly Service');

    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }) };
    }
    if (!customerId || !paymentIntentId || !monthlyCents) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Get PM from PaymentIntent
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['payment_method'] });
    const pmId = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id;
    if (!pmId) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Payment method not found on PaymentIntent' }) };
    }

    // Attach and set default
    try { await stripe.paymentMethods.attach(pmId, { customer: customerId }); }
    catch (e) { if (e?.code !== 'resource_already_exists') throw e; }
    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: pmId } });

    // Choose Price
    const priceId = pickPriceId(planName, monthlyCents);

    let sub;
    if (priceId) {
      sub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        automatic_tax: { enabled: true },
        collection_method: 'charge_automatically',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        metadata: { source: 'manual-fallback', fromPaymentIntent: paymentIntentId, planName },
      }, { idempotencyKey: `sub-from-pi-${paymentIntentId}` });
    } else if (PRODUCT_MONTHLY) {
      // Inline price using existing Product (no product_data)
      sub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency,
            product: PRODUCT_MONTHLY,
            unit_amount: monthlyCents,
            recurring: { interval: 'month' },
          },
        }],
        automatic_tax: { enabled: true },
        collection_method: 'charge_automatically',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        metadata: { source: 'manual-fallback', fromPaymentIntent: paymentIntentId, planName },
      }, { idempotencyKey: `sub-from-pi-${paymentIntentId}` });
    } else {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No Price or Product configured for subscription' }) };
    }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: sub.id, status: sub.status }) };
  } catch (err) {
    console.error('create-subscription error', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};