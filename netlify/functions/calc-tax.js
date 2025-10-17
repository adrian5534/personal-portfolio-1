/* eslint-env node */

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { currency = 'usd', subtotal, billing = {} } = JSON.parse(event.body || '{}');
    const amountCents = Math.max(Math.round(Number(subtotal || 0) * 100), 0);

    const country = String(billing.country || 'US').toUpperCase();
    // Normalize US state to 2-letter
    const normalizedState =
      country === 'US'
        ? String(billing.state || '')
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, 2)
        : billing.state || '';

    if (!amountCents) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taxCents: 0, totalCents: 0, subtotalCents: 0 }) };
    }
    // Require postal + state for US before calling Stripe tax
    if (country === 'US' && (!billing.postal || normalizedState.length !== 2)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxCents: 0, totalCents: amountCents, subtotalCents: amountCents, hint: 'us-location-required' }),
      };
    }

    const calc = await stripe.tax.calculations.create({
      currency,
      line_items: [{ amount: amountCents, reference: 'web_project', tax_code: 'txcd_99999999' }],
      customer_details: {
        address: {
          line1: billing.address1 || undefined,
          line2: billing.address2 || undefined,
          city: billing.city || undefined,
          state: normalizedState || undefined,
          postal_code: billing.postal || undefined,
          country,
        },
        address_source: 'billing',
      },
    });

    const taxCents = calc.amount_total - calc.amount_subtotal;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taxCents,
        totalCents: calc.amount_total,
        subtotalCents: calc.amount_subtotal,
        breakdown: calc.tax_breakdown || [],
      }),
    };
  } catch (err) {
    const body = JSON.parse(event.body || '{}');
    const amountCents = Math.max(Math.round(Number(body.subtotal || 0) * 100), 0);
    const addrParam = err?.raw?.param || '';
    const isAddressError =
      err?.code === 'customer_tax_location_invalid' ||
      addrParam.startsWith('customer_details[address]') ||
      err?.rawType === 'invalid_request_error';

    if (isAddressError) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxCents: 0, totalCents: amountCents, subtotalCents: amountCents, hint: 'address-fallback' }),
      };
    }

    console.error('calc-tax error', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};