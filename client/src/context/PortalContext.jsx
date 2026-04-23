import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { readJSON, writeJSON } from '../utils/storage';

const PortalContext = createContext(null);

const CART_KEY = 'sc_cart';
const ORDERS_KEY = 'sc_orders';
const POINTS_KEY = 'sc_points';
const LAST_ORDER_KEY = 'sc_last_order';

const defaultPoints = { total: 0, history: [] };

const calculatePoints = (amount) => {
  if (amount >= 100) return 12;
  if (amount >= 50) return 8;
  if (amount >= 20) return 5;
  return 0;
};

const buildOrderQrPayload = (order) => {
  return JSON.stringify({
    orderId: order.orderId,
    username: order.username,
    items: order.items.map((item) => ({ name: item.name, qty: item.qty })),
    totalAmount: order.totalAmount,
    pickupSlot: order.pickupSlot,
    timestamp: order.timestamp
  });
};

export const PortalProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => readJSON(CART_KEY, []));
  const [orders, setOrders] = useState(() => readJSON(ORDERS_KEY, []));
  const [points, setPoints] = useState(() => readJSON(POINTS_KEY, defaultPoints));
  const [lastOrder, setLastOrder] = useState(() => readJSON(LAST_ORDER_KEY, null));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    writeJSON(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    writeJSON(ORDERS_KEY, orders);
  }, [orders]);

  useEffect(() => {
    writeJSON(POINTS_KEY, points);
  }, [points]);

  useEffect(() => {
    writeJSON(LAST_ORDER_KEY, lastOrder);
  }, [lastOrder]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const notify = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 3200);
  };

  const addToCart = (menuItem) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === menuItem.id);

      if (existing) {
        return current.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...menuItem, quantity: 1 }];
    });

    notify(`${menuItem.name} added to cart`, 'success');
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId, delta) => {
    setCart((current) =>
      current
        .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((current) => current.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const syncOrdersFromStorage = () => {
    const latest = readJSON(ORDERS_KEY, []);
    setOrders(latest);
  };

  const updateOrders = (nextOrders) => {
    setOrders(nextOrders);
    writeJSON(ORDERS_KEY, nextOrders);
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === ORDERS_KEY) {
        syncOrdersFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const createOrder = ({ pickupSlot, paymentMethod }) => {
    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      imageUrl: item.imageUrl
    }));
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderId = `SC-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const timestamp = new Date().toISOString();
    const earnedPoints = calculatePoints(totalAmount);

    const order = {
      orderId,
      username: user?.username || 'student',
      items: orderItems,
      totalAmount,
      pickupSlot,
      paymentMethod,
      status: 'Confirmed',
      timestamp,
      pointsEarned: earnedPoints,
      qrPayload: buildOrderQrPayload({
        orderId,
        username: user?.username || 'student',
        items: orderItems,
        totalAmount,
        pickupSlot,
        timestamp
      })
    };
    const nextPoints = {
      total: points.total + earnedPoints,
      history: [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'earn',
          points: earnedPoints,
          description: `Order ${orderId} placed`,
          date: timestamp
        },
        ...points.history
      ]
    };

    const nextOrders = [order, ...orders];

    setOrders(nextOrders);
    setPoints(nextPoints);
    setLastOrder(order);
    clearCart();
    notify('Order placed successfully', 'success');

    if (earnedPoints > 0) {
      notify(`+${earnedPoints} Mess Points earned`, 'points');
    }

    return { order, earnedPoints };
  };

  const redeemPoints = () => {
    if (points.total < 100) {
      return null;
    }

    const timestamp = new Date().toISOString();
    const nextPoints = {
      total: points.total - 100,
      history: [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'redeem',
          points: -100,
          description: 'Redeemed for free meal',
          date: timestamp
        },
        ...points.history
      ]
    };

    setPoints(nextPoints);
    notify('Free meal claimed!', 'success');
    return timestamp;
  };

  const contextValue = useMemo(
    () => ({
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      orders,
      points,
      lastOrder,
      toasts,
      isCartOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      createOrder,
      redeemPoints,
      notify,
      showToast: notify,
      setIsCartOpen,
      updateOrders,
      syncOrdersFromStorage
    }),
    [cart, orders, points, lastOrder, toasts, isCartOpen]
  );

  return <PortalContext.Provider value={contextValue}>{children}</PortalContext.Provider>;
};

export const usePortal = () => {
  const context = useContext(PortalContext);

  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }

  return context;
};
