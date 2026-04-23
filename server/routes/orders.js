const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { menuItems, state } = require('../mockData');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const orders = req.user.role === 'admin' ? state.orders : state.orders.filter((order) => order.userId === req.user.id);
  return res.json(orders.slice().sort((a, b) => b.createdAt - a.createdAt));
});

router.post('/', authenticateToken, authorizeRoles('student', 'admin'), async (req, res) => {
  try {
    const orderId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const createdAt = Date.now();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const totalAmount = Number(req.body.totalAmount || 0);
    const pickupSlot = req.body.pickupSlot || '';

    items.forEach((item) => {
      const menuItem = menuItems.find((entry) => entry.id === item.menuItemId || entry.id === item.id);
      if (menuItem) {
        menuItem.remainingQuantity = Math.max(0, menuItem.remainingQuantity - Number(item.quantity || 1));
        if (menuItem.remainingQuantity === 0) {
          menuItem.isAvailable = false;
        }
      }
    });

    const order = {
      orderId,
      userId: req.user.id,
      username: req.user.username,
      items,
      totalAmount,
      status: 'confirmed',
      qrCode: req.body.qrCode || '',
      pickupSlot,
      createdAt
    };

    state.orders.push(order);
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
});

module.exports = router;
