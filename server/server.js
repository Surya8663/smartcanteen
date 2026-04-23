require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL || 'https://smartcanteen.vercel.app',
  'https://smartcanteen.vercel.app'
];

const corsOrigin = process.env.CORS_ORIGIN || allowedOrigins;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SmartCanteen API is running',
    timestamp: new Date().toISOString(),
    app: 'SmartCanteen Server',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SmartCanteen API is running',
    timestamp: new Date().toISOString(),
    app: 'SmartCanteen Server',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Mock Data Endpoint
app.get('/api/mock-data', (req, res) => {
  const { menuItems, pickupSlots } = require('./mockData');
  res.json({ menuItems, pickupSlots });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `No route found for ${req.method} ${req.path}`,
    statusCode: 404
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message,
    statusCode: err.status || 500,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`SmartCanteen Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${typeof corsOrigin === 'string' ? corsOrigin : 'Multiple origins'}`);
});
