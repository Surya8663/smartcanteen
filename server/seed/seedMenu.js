require('dotenv').config();

const connectDB = require('../config/db');
const MenuItem = require('../models/MenuItem');

const menuItems = [
  {
    name: 'Veg Thali',
    description: 'Rice, roti, dal, sabzi, salad, and chutney served fresh.',
    price: 85,
    category: 'Meals',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Paneer Butter Masala Rice Bowl',
    description: 'Creamy paneer butter masala with steamed rice.',
    price: 110,
    category: 'Meals',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy dosa with potato masala and coconut chutney.',
    price: 70,
    category: 'Meals',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Chole Bhature',
    description: 'Two fluffy bhature with spicy chole and onions.',
    price: 95,
    category: 'Meals',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2d3d2a2b1b74?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Samosa Pair',
    description: 'Golden crispy samosas with tangy green chutney.',
    price: 30,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f1a8f9?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Veg Puff',
    description: 'Flaky puff pastry stuffed with seasoned vegetables.',
    price: 25,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Aloo Tikki Burger',
    description: 'College-favorite burger with crispy aloo tikki and sauces.',
    price: 55,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Veg Sandwich',
    description: 'Grilled sandwich loaded with vegetables and cheese.',
    price: 45,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Masala Chai',
    description: 'Hot spiced tea perfect for lecture breaks.',
    price: 20,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cold Coffee',
    description: 'Chilled coffee blended with milk and cocoa.',
    price: 60,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime soda with a hint of mint.',
    price: 35,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Mango Shake',
    description: 'Thick seasonal mango shake topped with a creamy finish.',
    price: 75,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft syrup-soaked dessert served warm.',
    price: 40,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1621701625439-5f5211aee89d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rasgulla',
    description: 'Classic spongy Bengali sweets in light syrup.',
    price: 45,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?auto=format&fit=crop&w=800&q=80'
  }
];

const seedMenuItems = async () => {
  await connectDB();

  for (const item of menuItems) {
    await MenuItem.updateOne(
      { name: item.name },
      {
        $set: {
          ...item,
          isAvailable: true,
          totalQuantity: 100,
          remainingQuantity: 100,
          ratings: []
        }
      },
      { upsert: true }
    );
  }

  console.log(`Seeded ${menuItems.length} menu items.`);
};

if (require.main === module) {
  seedMenuItems()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Menu seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedMenuItems;
