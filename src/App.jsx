import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/routes';

function HashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1).split('?')[0];
    // wait a tick to ensure target section is mounted after route change
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    return () => clearTimeout(t);
  }, [hash, pathname]);
  return null;
}

function Layout() {
  return (
    <div className="app">
      <NavigationBar />
      <HashScroll />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {AppRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}