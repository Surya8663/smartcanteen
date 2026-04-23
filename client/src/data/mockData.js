export const menuItems = [
  { id: '1', name: 'Veg Thali', category: 'Meals', price: 60, description: 'Rice, dal, sabzi, roti, papad', isAvailable: true, remainingQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  { id: '2', name: 'Chicken Biryani', category: 'Meals', price: 90, description: 'Fragrant basmati rice with spiced chicken', isAvailable: true, remainingQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  { id: '3', name: 'Paneer Butter Masala + Roti', category: 'Meals', price: 80, description: 'Creamy paneer curry with 2 rotis', isAvailable: true, remainingQuantity: 25, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
  { id: '4', name: 'Egg Fried Rice', category: 'Meals', price: 70, description: 'Wok-tossed rice with eggs and veggies', isAvailable: true, remainingQuantity: 40, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { id: '5', name: 'Masala Dosa', category: 'Snacks', price: 40, description: 'Crispy dosa with potato filling & chutney', isAvailable: true, remainingQuantity: 60, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
  { id: '6', name: 'Vada Pav', category: 'Snacks', price: 20, description: 'Mumbai-style spicy potato fritter in a bun', isAvailable: true, remainingQuantity: 80, imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
  { id: '7', name: 'Samosa (2 pcs)', category: 'Snacks', price: 25, description: 'Crispy pastry stuffed with spiced potatoes', isAvailable: true, remainingQuantity: 100, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  { id: '8', name: 'Maggi Noodles', category: 'Snacks', price: 30, description: 'Classic instant noodles with masala', isAvailable: false, remainingQuantity: 0, imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400' },
  { id: '9', name: 'Masala Chai', category: 'Beverages', price: 15, description: 'Freshly brewed spiced Indian tea', isAvailable: true, remainingQuantity: 200, imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400' },
  { id: '10', name: 'Cold Coffee', category: 'Beverages', price: 35, description: 'Chilled blended coffee with milk', isAvailable: true, remainingQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { id: '11', name: 'Fresh Lime Soda', category: 'Beverages', price: 25, description: 'Sweet or salted lime with soda', isAvailable: true, remainingQuantity: 60, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400' },
  { id: '12', name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 30, description: 'Soft milk dumplings in sugar syrup', isAvailable: true, remainingQuantity: 45, imageUrl: 'https://images.unsplash.com/photo-1666005640804-d535fc3bc9e2?w=400' }
];

export const pickupSlots = [
  { id: 's1', label: '12:00 PM – 12:15 PM', crowdLevel: 'low' },
  { id: 's2', label: '12:15 PM – 12:30 PM', crowdLevel: 'medium' },
  { id: 's3', label: '12:30 PM – 12:45 PM', crowdLevel: 'high' },
  { id: 's4', label: '12:45 PM – 1:00 PM', crowdLevel: 'high' },
  { id: 's5', label: '1:00 PM – 1:15 PM', crowdLevel: 'medium' },
  { id: 's6', label: '1:15 PM – 1:30 PM', crowdLevel: 'low' }
];
