import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import TicketsPage from '@/pages/TicketsPage';
import TicketDetailPage from '@/pages/TicketDetailPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      updateCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      updateCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  return (
    <div className="App" dir="rtl">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage user={user} setUser={updateUser} />} />
          <Route path="/products" element={<ProductsPage user={user} setUser={updateUser} addToCart={addToCart} cart={cart} />} />
          <Route path="/products/:id" element={<ProductDetailPage user={user} setUser={updateUser} addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage user={user} setUser={updateUser} cart={cart} updateCart={updateCart} />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} setUser={updateUser} /> : <Navigate to="/" />} />
          <Route path="/tickets" element={user ? <TicketsPage user={user} setUser={updateUser} /> : <Navigate to="/" />} />
          <Route path="/tickets/:id" element={user ? <TicketDetailPage user={user} setUser={updateUser} /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.is_admin ? <AdminPage user={user} setUser={updateUser} /> : <Navigate to="/" />} />
          <Route path="/payment-success" element={<PaymentSuccessPage user={user} setUser={updateUser} updateCart={updateCart} />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;