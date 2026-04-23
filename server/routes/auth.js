const express = require('express');
const jwt = require('jsonwebtoken');
const { state } = require('../mockData');

const router = express.Router();

const buildRegistrationNumber = (username) => {
  const normalized = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'STUDENT';
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `${normalized}-${suffix}`;
};

router.post('/login', async (req, res) => {
  try {
    const { username = '', password = '' } = req.body;

    if (!username.trim() || !password.trim()) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        {
          id: 'admin-user',
          username: 'admin',
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          username: 'admin',
          role: 'admin'
        }
      });
    }

    let user = state.users.find((entry) => entry.username === username.trim() && entry.role === 'student');

    if (!user) {
      user = {
        id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        username: username.trim(),
        role: 'student',
        password,
        messPoints: 0,
        registrationNumber: buildRegistrationNumber(username)
      };

      state.users.push(user);
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        registrationNumber: user.registrationNumber,
        messPoints: user.messPoints
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
