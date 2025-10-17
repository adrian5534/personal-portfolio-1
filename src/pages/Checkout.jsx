import React, { useMemo } from 'react';
import Checkout from '../components/Checkout';
import '../styles/checkout.css';

function parseSelection() {
  const params = new URLSearchParams(window.location.search);
  const planKey = params.get('planKey') || '';
  const plan = params.get('plan') || '';
  const base = Number(params.get('base') || '') || 0;
  const oneTime = Number(params.get('oneTime') || '') || 0;
  const total = Number(params.get('total') || '') || base + oneTime;
  const monthly = Number(params.get('monthly') || '') || 0;
  const addons = (params.get('addons') || '').split('|').filter(Boolean);
  return { planKey, plan, base, oneTime, total, monthly, addons };
}

export default function CheckoutPage() {
  const selection = useMemo(parseSelection, []);
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <h1>Checkout</h1>
      </header>
      <Checkout selection={selection} />
    </div>
  );
}