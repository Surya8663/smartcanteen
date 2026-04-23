const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { menuItems, state } = require('../mockData');

const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const totalUsers = state.users.filter((user) => user.role === 'student').length;
  const totalOrders = state.orders.length;
  const totalMenuItems = menuItems.length;
  const pendingOrders = state.orders.filter((order) => order.status === 'pending').length;

  return res.json({
    totalUsers,
    totalOrders,
    totalMenuItems,
    pendingOrders
  });
});

module.exports = router;
