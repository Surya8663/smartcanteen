const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { menuItems } = require('../mockData');

const router = express.Router();

router.get('/', async (req, res) => {
  return res.json(menuItems);
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const menuItem = {
      id: `${Date.now()}`,
      ...req.body
    };

    menuItems.push(menuItem);
    return res.status(201).json(menuItem);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create menu item', error: error.message });
  }
});

module.exports = router;
