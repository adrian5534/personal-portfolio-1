import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/paymentconfirmation.css';

function cents(n = 0) {
  return `$${(Number(n || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Paymentconfirmation() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const pi = params.get('pi') || '';

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!pi) {
        setErr('Missing payment reference.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/.netlify/functions/get-payment-details?pi=${encodeURIComponent(pi)}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || 'Failed to load payment');
        if (mounted) setData(j);
      } catch (e) {
        if (mounted) setErr(e.message || 'Failed to load payment');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pi]);

  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.lineItems) && data.lineItems.length) return data.lineItems;
    if (data.description) return [{ name: data.description, qty: 1, amountCents: data.amount }];
    return [];
  }, [data]);

  if (loading) return (
    <div className="confirm-page">
      <div className="confirm-wrap"><div className="skeleton">Loading…</div></div>
    </div>
  );
  if (err) return (
    <div className="confirm-page">
      <div className="confirm-wrap">
        <div className="error-box">
          <h2>We couldn’t find your payment</h2>
          <p className="muted">{err}</p>
          <Link className="btn btn-dark" to="/checkout">Back to checkout</Link>
        </div>
      </div>
    </div>
  );
  if (!data) return null;

  const pm = data.payment_method || {};
  const billing = data.billing_details || {};
  const receiptUrl = data.receipt_url || '#';
  const orderNo = data.orderNumber || data.invoice?.number || ''; // use server-sourced number
  const subtotal = Number(data.metadata?.subtotalCents || 0);
  const tax = Number(data.metadata?.taxCents || 0);
  const total = Number(data.metadata?.totalCents || data.amount || 0);

  return (
    <div className="confirm-page">
      <div className="confirm-wrap">
        <div className="confirm-grid">
          <section className="left">
            <div className="panel">
              <div className="panel-header">
                <h3>Order confirmed</h3>
                <span className="muted">Thank you for your purchase</span>
              </div>
              <div className="notice">
                <div className="bullet" />
                <div>
                  <div>Payment received. A receipt has been sent to {data.receipt_email || billing.email || 'your email'}.</div>
                </div>
              </div>

              <div className="block">
                <h5>Billing address</h5>
                <div className="box">
                  <div>{billing.name || '-'}</div>
                  {billing.address?.line1 && <div>{billing.address.line1}</div>}
                  {billing.address?.line2 && <div>{billing.address.line2}</div>}
                  {(billing.address?.city || billing.address?.state || billing.address?.postal_code) && (
                    <div>
                      {billing.address.city || ''}{billing.address.city ? ', ' : ''}
                      {billing.address.state || ''} {billing.address.postal_code || ''}
                    </div>
                  )}
                  {billing.address?.country && <div>{billing.address.country}</div>}
                  {billing.phone && <div>{billing.phone}</div>}
                </div>
              </div>

              <div className="block">
                <h5>Payment method</h5>
                <div className="box">
                  <div className="pm-row">
                    <span>Card</span>
                    <span>•••• {pm.last4 || '••••'} · {pm.exp_month || 'MM'}/{String(pm.exp_year || 'YY').toString().slice(-2)}</span>
                  </div>
                </div>
              </div>

              <div className="actions">
                <a className="btn btn-dark" href={receiptUrl} target="_blank" rel="noreferrer">Download receipt</a>
                <Link className="btn btn-light" to="/">Back to home</Link>
              </div>

              <div className="chips">
                <Link to="/#contact" className="chip">Support</Link>
              </div>
            </div>
          </section>

          <aside className="right">
            <div className="panel receipt-panel">
              <div className="panel-header">
                <h4>Your receipt</h4>
                <span className="muted">Order #{orderNo || (data.id?.slice(-6).toUpperCase())}</span>
              </div>

              <div className="receipt-items">
                {items.map((it, idx) => (
                  <div key={idx} className="r-item">
                    <div className="label">{it.name || 'Item'}</div>
                    <div className="amount">{cents(it.amountCents)}</div>
                  </div>
                ))}
              </div>

              <hr className="section-divider" />

              <div className="summary">
                <div className="sum-row">
                  <div>Subtotal</div>
                  <div className="value">{cents(subtotal)}</div>
                </div>
                <div className="sum-row">
                  <div>Tax</div>
                  <div className="value">{cents(tax)}</div>
                </div>
                <div className="sum-row total">
                  <div>Total paid</div>
                  <div className="value">{cents(total)}</div>
                </div>
              </div>

              <div className="meta">
                <div className="meta-block">
                  <div>Delivery</div>
                  <div className="value">Instant · Email</div>
                </div>
                <div className="meta-block">
                  <div>Receipt sent to</div>
                  <div className="value">{data.receipt_email || billing.email || '-'}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}