import { storage } from './storage';

/**
 * Demo Mode — Seeds the app with realistic test data for presentations
 * Call seedDemoData() to populate localStorage with demo orders, points, user, etc.
 */

const DEMO_STUDENT_NAMES = [
  'rahul_21', 'priya_cs', 'arjun_m', 'sneha_e', 'vikram_d',
  'aisha_k', 'rohan_p', 'deepika_r', 'harsh_s', 'neha_j',
  'amit_b', 'zara_l', 'suresh_m', 'maya_n', 'kabir_t'
];

const MENU_ITEMS = [
  { id: 1, name: 'Chicken Biryani', price: 80, category: 'Meals' },
  { id: 2, name: 'Veg Thali', price: 60, category: 'Meals' },
  { id: 3, name: 'Butter Chicken', price: 90, category: 'Meals' },
  { id: 4, name: 'Samosa', price: 15, category: 'Snacks' },
  { id: 5, name: 'Masala Chai', price: 20, category: 'Beverages' },
  { id: 6, name: 'Gulab Jamun', price: 30, category: 'Desserts' },
  { id: 7, name: 'Paneer Tikka', price: 70, category: 'Snacks' },
  { id: 8, name: 'Iced Coffee', price: 40, category: 'Beverages' }
];

const PICKUP_SLOTS = [
  '12:00-12:15',
  '12:15-12:30',
  '12:30-12:45',
  '12:45-13:00',
  '13:00-13:15',
  '13:15-13:30'
];

// Realistic crowd distribution: slot 4 is peak
const SLOT_CROWD_MAP = [6, 14, 28, 35, 18, 8];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDemoOrders(count) {
  const orders = [];
  const today = new Date();
  const baseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

  for (let i = 0; i < count; i++) {
    const slotIndex = i % 6; // Distribute across slots
    const slotStart = new Date(baseTime.getTime() + slotIndex * 15 * 60000);
    
    // Random order time within the slot
    const orderTime = new Date(slotStart.getTime() + Math.random() * 15 * 60000);
    
    // Minutes elapsed since order
    const minutesElapsed = Math.floor(Math.random() * 20);
    
    // Determine status based on time elapsed
    let status = 'Completed';
    if (minutesElapsed < 5) status = 'Confirmed';
    else if (minutesElapsed < 10) status = 'Preparing';
    else if (minutesElapsed < 15) status = 'Ready';

    // Random items (1-2 items per order)
    const numItems = Math.random() > 0.5 ? 1 : 2;
    const items = [];
    let total = 0;
    for (let j = 0; j < numItems; j++) {
      const item = getRandomItem(MENU_ITEMS);
      items.push({ ...item, quantity: 1 });
      total += item.price;
    }

    orders.push({
      id: `SC${String(1001 + i).padStart(3, '0')}`,
      username: getRandomItem(DEMO_STUDENT_NAMES),
      items: items,
      total: total,
      status: status,
      slot: PICKUP_SLOTS[slotIndex],
      paymentMethod: Math.random() > 0.5 ? 'UPI' : 'Card',
      qrCode: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Crect fill='%23000' x='10' y='10' width='180' height='180'/%3E%3C/svg%3E`,
      timestamp: orderTime.toISOString(),
      pointsEarned: Math.floor(total / 10),
      createdAt: new Date(today.getTime() - Math.random() * 24 * 60 * 60000).toISOString()
    });
  }

  return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateDemoPointsHistory() {
  const today = new Date();
  const history = [];
  let runningTotal = 0;

  // Last 8 orders today
  for (let i = 0; i < 8; i++) {
    const pointsEarned = Math.floor(Math.random() * 20) + 5;
    runningTotal += pointsEarned;
    
    const items = [];
    for (let j = 0; j < Math.floor(Math.random() * 2) + 1; j++) {
      items.push(getRandomItem(MENU_ITEMS).name);
    }

    history.unshift({
      type: 'earn',
      points: pointsEarned,
      description: `Order #SC${String(1001 + Math.floor(Math.random() * 100)).padStart(3, '0')} — ${items.join(', ')}`,
      date: new Date(today.getTime() - Math.random() * 12 * 60 * 60000).toISOString()
    });
  }

  return {
    total: Math.min(runningTotal, 95),
    history: history
  };
}

export function seedDemoData() {
  const demoOrders = generateDemoOrders(25);
  const demoPoints = generateDemoPointsHistory();
  const today = new Date().toISOString().split('T')[0];

  const demoUser = {
    id: 'demo_student_001',
    username: 'demo_student',
    role: 'student',
    email: 'demo@smartcanteen.local',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
  };

  // Seed localStorage
  storage.set('sc_orders', demoOrders);
  storage.set('sc_points', demoPoints);
  storage.set('sc_user', demoUser);
  storage.set('sc_streak', JSON.stringify({
    count: 3,
    lastOrderDate: today,
    streak: [today, new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0]]
  }));
  storage.set('sc_cart', []);
  storage.set('sc_settings', JSON.stringify({
    canteenNotice: '🔔 New: Midnight snacks available 11 PM - 1 AM! Order online and skip the line.',
    adminName: 'SmartCanteen Admin',
    contactEmail: 'admin@smartcanteen.local'
  }));
  storage.set('sc_theme', 'light');

  return {
    ordersCount: demoOrders.length,
    totalPoints: demoPoints.total,
    username: demoUser.username
  };
}

export function seedAdminDemoData() {
  const adminUser = {
    id: 'admin_001',
    username: 'admin',
    role: 'admin',
    email: 'admin@smartcanteen.local',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString()
  };

  storage.set('sc_user', adminUser);
  storage.set('sc_theme', 'light');

  return {
    username: adminUser.username,
    role: adminUser.role
  };
}

export function clearDemoData() {
  storage.remove('sc_orders');
  storage.remove('sc_points');
  storage.remove('sc_user');
  storage.remove('sc_streak');
  storage.remove('sc_cart');
  storage.remove('sc_settings');
}
