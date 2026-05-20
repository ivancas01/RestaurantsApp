import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const { cmsData } = useAdmin();
  const { showNotification } = useNotification();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('urban_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
  }, []);

  // Save cart and calculate total
  useEffect(() => {
    localStorage.setItem('urban_cart', JSON.stringify(cartItems));
    const newTotal = cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return acc + price * item.quantity;
    }, 0);
    setTotal(newTotal);
  }, [cartItems]);

  const addToCart = (product) => {
    // Operational closed check
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (cmsData?.contact?.opening_time || "08:00:00").split(':').map(Number);
    const [closeH, closeM] = (cmsData?.contact?.closing_time || "22:00:00").split(':').map(Number);
    const openingTime = openH * 60 + (openM || 0);
    const closingTime = closeH * 60 + (closeM || 0);

    let isClosed = false;
    if (closingTime < openingTime) {
      isClosed = !(currentTime >= openingTime || currentTime <= closingTime);
    } else {
      isClosed = !(currentTime >= openingTime && currentTime <= closingTime);
    }

    if (isClosed) {
      showNotification("El local está fuera de servicio en este momento.", "error");
      setIsCartOpen(true);
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => String(item.id) === String(product.id));
      if (existingItem) {
        return prevItems.map((item) =>
          String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, notes: '' }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const updateNotes = (productId, notes) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id) === String(productId) ? { ...item, notes } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isCartOpen,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        toggleCart,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
