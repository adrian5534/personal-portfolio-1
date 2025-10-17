import React from 'react';
import { Route } from 'react-router-dom';
import Home from '../pages/Home';
import CheckoutPage from '../pages/Checkout';
import Paymentconfirmation from '../components/Paymentconfirmation';

function NotFound() {
  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Page not found</h1>
      <p>Go back to the homepage.</p>
      <a href="/">Home</a>
    </div>
  );
}

// Export a Route list to be nested under Layout in App.jsx
const AppRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/payment-confirmation" element={<Paymentconfirmation />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default AppRoutes;