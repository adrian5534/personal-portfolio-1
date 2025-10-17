/* eslint-env node */
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const pi = (event.queryStringParameters?.pi || '').trim();
    if (!pi) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing pi param' }) };
    }

    const intent = await stripe.paymentIntents.retrieve(pi, {
      expand: ['latest_charge.invoice', 'payment_method'],
    });

    const charge = intent.latest_charge && typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
    const pm = intent.payment_method && typeof intent.payment_method === 'object' ? intent.payment_method : null;
    const invoice = charge && typeof charge.invoice === 'object' ? charge.invoice : null;

    const metadata = intent.metadata || {};
    // Parse compact line items if provided by create-payment-intent
    let lineItems = [];
    try {
      if (metadata.lineItems) lineItems = JSON.parse(metadata.lineItems);
    } catch { /* ignore parse errors */ }

    const orderNumber =
      metadata.orderNumber ||               // your custom order number (recommended)
      invoice?.number ||                    // Stripe Invoice number (if invoiced)
      charge?.receipt_number ||             // rarely present for direct charges
      null;

    const payload = {
      id: intent.id,
      created: intent.created,
      currency: intent.currency,
      amount: intent.amount,
      status: intent.status,
      description: intent.description,
      receipt_email: charge?.receipt_email || intent.receipt_email || null,
      receipt_url: charge?.receipt_url || null,
      charge_id: typeof intent.latest_charge === 'string' ? intent.latest_charge : charge?.id || null,
      orderNumber,                          // <= expose normalized order/receipt number
      invoice: invoice ? {
        id: invoice.id,
        number: invoice.number || null,
        hosted_invoice_url: invoice.hosted_invoice_url || null,
        invoice_pdf: invoice.invoice_pdf || null,
      } : null,
      customer: typeof intent.customer === 'string' ? intent.customer : intent.customer?.id || null,
      payment_method: {
        brand: pm?.card?.brand || charge?.payment_method_details?.card?.brand || null,
        last4: pm?.card?.last4 || charge?.payment_method_details?.card?.last4 || null,
        exp_month: pm?.card?.exp_month || null,
        exp_year: pm?.card?.exp_year || null,
      },
      billing_details: charge?.billing_details || null,
      metadata: {
        subtotalCents: Number(metadata.subtotalCents || 0),
        taxCents: Number(metadata.taxCents || 0),
        totalCents: Number(metadata.totalCents || intent.amount || 0),
        monthlyCents: Number(metadata.monthlyCents || 0),
        plan: metadata.plan || metadata.planKey || '',
        coupon: metadata.coupon || '',
        orderNumber: metadata.orderNumber || '',
      },
      lineItems,
    };

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
  } catch (err) {
    console.error('get-payment-details error', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};