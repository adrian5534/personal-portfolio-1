import React, { useMemo, useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
const currency = (n) => `$${(Number(n) || 0).toLocaleString()}`;

const elementStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      '::placeholder': { color: '#9ca3af' },
    },
  },
};

// Map monthly add-ons to cents
const MONTHLY_ADDONS = {
  'Basic maintenance': 10000,      // $100/mo
  'Monthly optimization': 20000,   // $200/mo
  'Maintenance plan': 30000,       // $300/mo
};

// Prefer explicit selection.monthly (USD), else sum from add-on names
function getMonthlyCents(selection) {
  const explicit = Number(selection?.monthly || 0);
  if (explicit > 0) return Math.round(explicit * 100);
  const names = Array.isArray(selection?.addons) ? selection.addons : [];
  return names.reduce((sum, name) => sum + (MONTHLY_ADDONS[name] || 0), 0);
}

// Simple debounce hook
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function PaymentForm({ selection, billing, setBilling, amountCents }) {
  const stripe = useStripe();
  const navigate = useNavigate();
  const [pr, setPr] = useState(null);
  const [canPay, setCanPay] = useState(false);

  useEffect(() => {
    if (!stripe) return;
    const paymentRequest = stripe.paymentRequest({
      country: billing.country || 'US',
      currency: 'usd',
      total: { label: 'Total', amount: Math.max(amountCents || 0, 0) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    paymentRequest.canMakePayment().then((res) => setCanPay(!!res));
    setPr(paymentRequest);
  }, [stripe, amountCents, billing.country]);

  useEffect(() => {
    if (!pr || !stripe) return;
    const handler = async (ev) => {
      try {
        const monthlyCents = getMonthlyCents(selection);

        const res = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.max(amountCents || 0, 0),
            currency: 'usd',
            receipt_email: ev.payerEmail,
            monthlyCents,
            metadata: { source: 'payment-request', plan: selection?.plan || '' },
          }),
        });

        const ct = res.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await res.json() : await res.text();
        if (!res.ok) throw new Error((payload && payload.error) || payload || 'Failed to create payment');

        const { error, paymentIntent } = await stripe.confirmCardPayment(payload.clientSecret, {
          payment_method: ev.paymentMethod.id,
        });

        if (error) {
          ev.complete('fail');
          toast.error(error.message || 'Payment failed');
          return;
        }

        ev.complete('success');
        toast.success('Payment successful!');

        // Create subscription for wallet flow too
        if (monthlyCents > 0 && payload.customerId && paymentIntent?.status === 'succeeded') {
          try {
            const r = await fetch('/.netlify/functions/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: payload.customerId,
                paymentIntentId: paymentIntent.id,
                monthlyCents,
                currency: 'usd',
                plan: selection?.plan || 'Monthly Service',
              }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || 'Subscription error');
            toast.success('Subscription created');
          } catch (e) {
            toast.error(e.message || 'Subscription creation failed');
          }
        }

        // Redirect to confirmation
        if (paymentIntent?.id) {
          navigate(`/payment-confirmation?pi=${encodeURIComponent(paymentIntent.id)}`);
        }
      } catch (e) {
        ev.complete('fail');
        toast.error(e.message || 'Wallet payment failed');
      }
    };

    pr.on('paymentmethod', handler);
    return () => {
      // Some environments don't expose .off(); no-op cleanup is fine.
    };
  }, [pr, stripe, amountCents, selection, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBilling((prev) => {
      let v = type === 'checkbox' ? checked : value;
      if (name === 'state' && (prev.country || 'US') === 'US') {
        v = String(v).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2); // e.g., NYC -> NY
      }
      return { ...prev, [name]: v };
    });
  };

  return (
    <Card className="checkout-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Billing details</h5>
          <span className="text-muted small">All fields required</span>
        </div>

        <Form className="billing-grid">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Full name</Form.Label>
              <Form.Control name="name" value={billing.name} onChange={onChange} placeholder="John Doe" required />
            </Col>
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={billing.email} onChange={onChange} placeholder="john.doe@example.com" required />
            </Col>

            <Col md={6}>
              <Form.Label>Phone number</Form.Label>
              <Form.Control name="phone" value={billing.phone} onChange={onChange} placeholder="(555) 123-4567" />
            </Col>
            <Col md={6}>
              <Form.Label>Address line 1</Form.Label>
              <Form.Control name="address1" value={billing.address1} onChange={onChange} placeholder="123 Main Street" required />
            </Col>

            <Col md={6}>
              <Form.Label>Address line 2 (optional)</Form.Label>
              <Form.Control name="address2" value={billing.address2} onChange={onChange} placeholder="Apt, suite, unit" />
            </Col>
            <Col md={6}>
              <Form.Label>City</Form.Label>
              <Form.Control name="city" value={billing.city} onChange={onChange} placeholder="San Francisco" required />
            </Col>

            <Col md={6}>
              <Form.Label>State/Region</Form.Label>
              <Form.Control name="state" value={billing.state} onChange={onChange} placeholder="CA" required />
            </Col>
            <Col md={6}>
              <Form.Label>Postal code</Form.Label>
              <Form.Control name="postal" value={billing.postal} onChange={onChange} placeholder="94105" required />
            </Col>

            <Col md={6}>
              <Form.Label>Country</Form.Label>
              <Form.Select name="country" value={billing.country} onChange={onChange} required>
                <option value="US">United States</option>
              </Form.Select>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Form.Check
                type="checkbox"
                id="updates"
                label="Send me updates and receipts via email"
                name="updates"
                checked={billing.updates}
                onChange={onChange}
              />
            </Col>
          </Row>
        </Form>

        <h5 className="mt-4">Payment method</h5>

        <div className="mb-3">
          {canPay && pr && (
            <PaymentRequestButtonElement
              options={{
                paymentRequest: pr,
                style: { paymentRequestButton: { type: 'default', theme: 'dark', height: '40px' } },
              }}
            />
          )}
        </div>

        <Row className="g-3">
          <Col md={12}>
            <Form.Label>Card number</Form.Label>
            <div className="card-input">
              <CardNumberElement options={elementStyle} />
            </div>
          </Col>
          <Col md={6}>
            <Form.Label>Expiration</Form.Label>
            <div className="card-input">
              <CardExpiryElement options={elementStyle} />
            </div>
          </Col>
          <Col md={6}>
            <Form.Label>CVV</Form.Label>
            <div className="card-input">
              <CardCvcElement options={elementStyle} />
            </div>
          </Col>

          <Col md={12}>
            <Form.Check
              type="checkbox"
              id="save"
              label="Save card for future payments"
              name="save"
              checked={billing.save}
              onChange={onChange}
            />
          </Col>
        </Row>

        <div className="mt-3 small">
          Need help? <Link to="/#contact">Contact support</Link>
        </div>
      </Card.Body>
    </Card>
  );
}

function centsToCurrency(c) {
  return `$${(Number(c || 0) / 100).toLocaleString()}`;
}

function OrderSummary({ selection, billing, onTotalChange }) {
  const stripe = useStripe();
  const navigate = useNavigate();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxCents, setTaxCents] = useState(0);
  const [totalCents, setTotalCents] = useState(Math.round((selection?.total || 0) * 100));

  const base = useMemo(() => {
    const b = Number(selection?.base);
    if (!isNaN(b) && b > 0) return b;
    const t = Number(selection?.total || 0);
    const ot = Number(selection?.oneTime || 0);
    return Math.max(t - ot, 0);
  }, [selection]);

  const oneTime = Number(selection?.oneTime || 0);

  // One-time subtotal (today)
  const subtotal = base + oneTime;

  const monthlyCentsUI = useMemo(() => getMonthlyCents(selection), [selection]);
  const monthlyUSD = monthlyCentsUI / 100;

  const taxPayload = useMemo(
    () => ({
      address1: billing.address1 || '',
      address2: billing.address2 || '',
      city: billing.city || '',
      state: (billing.state || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
      postal: billing.postal || '',
      country: billing.country || 'US',
    }),
    [billing.address1, billing.address2, billing.city, billing.state, billing.postal, billing.country]
  );

  // Debounced tax input
  const taxInput = useMemo(
    () => ({
      subtotal: Math.max(subtotal - discount, 0),
      country: String(taxPayload.country || 'US').toUpperCase(),
      state: taxPayload.state || '',
      postal: taxPayload.postal || '',
      city: (taxPayload.city || '').trim(),
      address1: (taxPayload.address1 || '').trim(),
      address2: (taxPayload.address2 || '').trim(),
    }),
    [subtotal, discount, taxPayload]
  );
  const debouncedTaxInput = useDebouncedValue(taxInput, 400);
  const lastKeyRef = useRef('');

  useEffect(() => {
    const { subtotal, country, state, postal, city, address1, address2 } = debouncedTaxInput;
    const key = JSON.stringify({ subtotal, country, state, postal, city, address1, address2 });
    if (key === lastKeyRef.current) return;

    if (country === 'US' && (!postal || state.length !== 2)) {
      const fallback = Math.round(subtotal * 100);
      setTaxCents(0);
      setTotalCents(fallback);
      onTotalChange?.(fallback);
      lastKeyRef.current = key;
      return;
    }

    if (!subtotal) {
      setTaxCents(0);
      setTotalCents(0);
      onTotalChange?.(0);
      lastKeyRef.current = key;
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/calc-tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currency: 'usd',
            subtotal,
            billing: { address1, address2, city, state, postal, country },
          }),
          signal: ac.signal,
        });

        const ct = res.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await res.json() : await res.text();

        if (res.ok) {
          const reportedSubtotal = Number(payload?.subtotalCents ?? Math.round(subtotal * 100));
          const reportedTotal = Number(payload?.totalCents ?? Math.round(subtotal * 100));
          const newTax = Number(payload?.taxCents);
          const derived = Math.max(reportedTotal - reportedSubtotal, 0);
          const finalTax = Number.isFinite(newTax) && newTax > 0 ? newTax : derived;

          setTaxCents(finalTax);
          setTotalCents(reportedTotal);
          onTotalChange?.(reportedTotal);
        } else {
          const fallback = Math.round(subtotal * 100);
          setTaxCents(0);
          setTotalCents(fallback);
          onTotalChange?.(fallback);
          if (typeof payload === 'string') console.warn('calc-tax error:', payload);
        }
        lastKeyRef.current = key;
      } catch (e) {
        if (e.name !== 'AbortError') {
          const fallback = Math.round(subtotal * 100);
          setTaxCents(0);
          setTotalCents(fallback);
          onTotalChange?.(fallback);
          console.error('calc-tax fetch failed', e);
        }
      }
    })();

    return () => ac.abort();
  }, [debouncedTaxInput, onTotalChange]);

  const applyCoupon = () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    let d = 0;
    if (c === 'SAVE10') d = Math.round(subtotal * 0.1);
    else if (c === 'SAVE25') d = 25;
    else if (c === 'SAVE50') d = 50;
    else return toast.error('Invalid coupon');
    setDiscount(d);
    setApplied(c);
    toast.success(`Coupon ${c} applied`);
  };

  const validate = () => {
    const required = ['name', 'email', 'address1', 'city', 'state', 'postal', 'country'];
    for (const k of required) {
      if (!billing[k]) return `Please fill ${k}`;
    }
    if ((billing.country || 'US') === 'US' && taxPayload.state.length !== 2) {
      return 'Please use a 2-letter state code (e.g., NY)';
    }
    return '';
  };

  const onPay = async () => {
    if (!stripe || !elements) return;

    const err = validate();
    if (err) return toast.error(err);
    if (!totalCents || totalCents < 50) return toast.error('No amount to charge.');

    const baseCents = Math.round(Number(base || 0) * 100);
    const oneTimeCents = Math.round(Number(oneTime || 0) * 100);
    const subtotalAfterDiscountCents = Math.round(Math.max(subtotal - discount, 0) * 100);
    const derivedTaxCents = taxCents || Math.max(totalCents - subtotalAfterDiscountCents, 0);
    const monthlyCents = getMonthlyCents(selection);

    const lineItems = [
      { type: 'plan', name: selection?.plan || 'Plan', qty: 1, amountCents: baseCents },
      ...(oneTimeCents > 0 ? [{ type: 'one_time', name: 'One‑time add‑ons', qty: 1, amountCents: oneTimeCents }] : []),
    ];
    const summary =
      `${selection?.plan || 'Plan'} — ` +
      `Subtotal ${centsToCurrency(subtotalAfterDiscountCents)} | ` +
      `Tax ${centsToCurrency(derivedTaxCents)} | ` +
      `Total ${centsToCurrency(totalCents)}` +
      (monthlyCents > 0 ? ` | + ${centsToCurrency(monthlyCents)} /mo` : '');

    setSubmitting(true);
    try {
      const res = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalCents,
          currency: 'usd',
          receipt_email: billing.email,
          summary,
          subtotalCents: subtotalAfterDiscountCents,
          taxCents: derivedTaxCents,
          totalCents,
          monthlyCents, // send to server
          lineItems,
          billing,
          metadata: {
            planKey: selection?.planKey || '',
            plan: selection?.plan || '',
            base: String(base || 0),
            oneTime: String(oneTime || 0),
            monthly: String(monthlyCents / 100),
            addons: (selection?.addons || []).join(','),
            coupon: applied || '',
            taxCents: String(derivedTaxCents),
            source: 'checkout-page',
          },
        }),
      });

      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error((payload && payload.error) || payload || 'Failed to create payment');

      const card = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(payload.clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: billing.name,
            email: billing.email,
            phone: billing.phone || undefined,
            address: {
              line1: billing.address1,
              line2: billing.address2 || undefined,
              city: billing.city,
              state: taxPayload.state,
              postal_code: taxPayload.postal,
              country: taxPayload.country,
            },
          },
        },
        setup_future_usage: (billing.save || monthlyCents > 0) ? 'off_session' : undefined,
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');

        // Fallback: create subscription now (no webhook needed)
        if (monthlyCents > 0 && payload.customerId) {
          try {
            const r = await fetch('/.netlify/functions/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: payload.customerId,
                paymentIntentId: paymentIntent.id,
                monthlyCents,
                currency: 'usd',
                plan: selection?.plan || 'Monthly Service',
              }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || 'Subscription error');
            toast.success('Subscription created');
          } catch (e) {
            toast.error(e.message || 'Subscription creation failed');
          }
        }

        // Redirect to confirmation
        if (paymentIntent?.id) {
          navigate(`/payment-confirmation?pi=${encodeURIComponent(paymentIntent.id)}`);
        }
      } else {
        toast.info('Payment status: ' + (paymentIntent?.status || 'unknown'));
      }
    } catch (e) {
      toast.error(e.message || 'Payment error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="order-summary">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Order summary</h5>
          <span className="text-muted small">Instant delivery</span>
        </div>

        <div className="order-items">
          <div className="item">
            <div className="label">{selection?.plan || 'Selected plan'}</div>
            <div className="amount">{currency(base)}</div>
          </div>
          <div className="item">
            <div className="label">One‑time add‑ons</div>
            <div className="amount">{currency(oneTime)}</div>
          </div>
        </div>

        <div className="summary-line mt-3">
          <div>Subtotal (today)</div>
          <div>{centsToCurrency(Math.round(Math.max(subtotal - discount, 0) * 100))}</div>
        </div>
        <div className="summary-line">
          <div>Tax</div>
          <div>{centsToCurrency(taxCents)}</div>
        </div>
        {discount > 0 && (
          <div className="summary-line text-success">
            <div>Discount {applied ? `(${applied})` : ''}</div>
            <div>-{currency(discount)}</div>
          </div>
        )}
        <div className="summary-line total-line">
          <div>Total due today</div>
          <div>{centsToCurrency(totalCents)}</div>
        </div>

        {monthlyCentsUI > 0 && (
          <>
            <hr />
            <div className="summary-line">
              <div>Monthly add‑ons</div>
              <div>{currency(monthlyUSD)}/mo</div>
            </div>
            <div className="small text-muted">Billed monthly starting in 1 month.</div>
          </>
        )}

        <InputGroup className="mt-3">
          <Form.Control placeholder="Enter coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button variant="outline-secondary" onClick={applyCoupon}>Apply</Button>
        </InputGroup>

        <Button onClick={onPay} variant="dark" className="w-100 py-2 mt-3" disabled={!stripe || submitting}>
          {submitting ? 'Processing…' : 'Complete Purchase'}
        </Button>

        <div className="mt-2 small text-muted">By completing this purchase you agree to the Terms.</div>
      </Card.Body>
    </Card>
  );
}

export default function Checkout({ selection }) {
  const [billing, setBilling] = useState({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal: '',
    country: 'US',
    updates: false,
    save: false,
  });
  const [computedTotalCents, setComputedTotalCents] = useState(Math.round((selection?.total || 0) * 100));

  return (
    <Elements stripe={stripePromise}>
      <Row className="checkout-grid g-4">
        <Col lg={7} md={7} sm={12}>
          <PaymentForm selection={selection} billing={billing} setBilling={setBilling} amountCents={computedTotalCents} />
        </Col>
        <Col lg={5} md={5} sm={12}>
          <OrderSummary selection={selection} billing={billing} onTotalChange={setComputedTotalCents} />
        </Col>
      </Row>
    </Elements>
  );
}