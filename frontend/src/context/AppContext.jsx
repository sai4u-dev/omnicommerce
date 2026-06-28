import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('gg_token') || '');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [sessionId, setSessionId] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // 1. Initialize Session ID for anonymous users
  useEffect(() => {
    let existingSession = localStorage.getItem('gg_session_id');
    if (!existingSession) {
      existingSession = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('gg_session_id', existingSession);
    }
    setSessionId(existingSession);
  }, []);

  // 2. Decode user from token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        localStorage.setItem('gg_token', token);
      } catch (e) {
        console.error('Invalid token format');
        logout();
      }
    } else {
      setUser(null);
      localStorage.removeItem('gg_token');
    }
  }, [token]);

  // 3. Fetch Cart on load / auth change
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_URL}/cart`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCart(data);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      }
    };

    if (sessionId) {
      fetchCart();
    }
  }, [token, sessionId]);

  // Sync Cart helper
  const syncCart = async (updatedCart) => {
    setCart(updatedCart);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items: updatedCart }),
      });
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCart([]);
    localStorage.removeItem('gg_token');
  };

  const addToCart = async (product, quantity = 1, variantId = null) => {
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.variantId === variantId
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        brand: product.brand,
        quantity,
        variantId,
        variantName: product.variants?.find(v => v.id === variantId)?.name || 'Standard Size'
      });
    }
    await syncCart(newCart);
  };

  const updateQuantity = async (productId, quantity, variantId = null) => {
    const newCart = cart.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    await syncCart(newCart);
  };

  const removeFromCart = async (productId, variantId = null) => {
    const newCart = cart.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    await syncCart(newCart);
  };

  const clearCart = async () => {
    setCart([]);
    try {
      const headers = {
        'x-session-id': sessionId,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${API_URL}/cart`, { method: 'DELETE', headers });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        cart,
        sessionId,
        login,
        logout,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        API_URL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
