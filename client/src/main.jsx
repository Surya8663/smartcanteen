import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import { AuthProvider } from './context/AuthContext';
import { PortalProvider } from './context/PortalContext';
import { menuItems } from './data/mockData';
import './index.css';

function seedMockDataIfEmpty() {
  const existing = JSON.parse(localStorage.getItem('sc_orders') || '[]');
  if (Array.isArray(existing) && existing.length > 0) return;

  const existingMenu = JSON.parse(localStorage.getItem('sc_menu') || '[]');
  if (!Array.isArray(existingMenu) || existingMenu.length === 0) {
    localStorage.setItem('sc_menu', JSON.stringify(menuItems));
  }

  const today = new Date();
  const fmt = (h, m) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const slotIdToLabel = {
    s1: '12:00 PM – 12:15 PM',
    s2: '12:15 PM – 12:30 PM',
    s3: '12:30 PM – 12:45 PM',
    s4: '12:45 PM – 1:00 PM',
    s5: '1:00 PM – 1:15 PM',
    s6: '1:15 PM – 1:30 PM'
  };

  const mockOrders = [
    { orderId: 'SC-1001', username: 'rahul_cs21', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }], totalAmount: 60, pickupSlot: 's1', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 2) },
    { orderId: 'SC-1002', username: 'priya_ece', items: [{ id: '9', name: 'Masala Chai', quantity: 2, price: 15 }], totalAmount: 30, pickupSlot: 's1', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 4) },
    { orderId: 'SC-1003', username: 'arun_mech', items: [{ id: '5', name: 'Masala Dosa', quantity: 1, price: 40 }], totalAmount: 40, pickupSlot: 's1', status: 'completed', paymentMethod: 'Card', createdAt: fmt(12, 6) },
    { orderId: 'SC-1004', username: 'divya_it', items: [{ id: '7', name: 'Samosa (2 pcs)', quantity: 1, price: 25 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 60, pickupSlot: 's1', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 8) },
    { orderId: 'SC-1005', username: 'karthik_cse', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's1', status: 'completed', paymentMethod: 'Wallet', createdAt: fmt(12, 11) },
    { orderId: 'SC-1006', username: 'sneha_civil', items: [{ id: '6', name: 'Vada Pav', quantity: 2, price: 20 }], totalAmount: 40, pickupSlot: 's1', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 13) },

    { orderId: 'SC-1007', username: 'arjun_eee', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }], totalAmount: 80, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 16) },
    { orderId: 'SC-1008', username: 'meena_bio', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }, { id: '9', name: 'Masala Chai', quantity: 1, price: 15 }], totalAmount: 75, pickupSlot: 's2', status: 'completed', paymentMethod: 'Card', createdAt: fmt(12, 17) },
    { orderId: 'SC-1009', username: 'vijay_mba', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 18) },
    { orderId: 'SC-1010', username: 'lakshmi_arts', items: [{ id: '5', name: 'Masala Dosa', quantity: 2, price: 40 }], totalAmount: 80, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 19) },
    { orderId: 'SC-1011', username: 'ravi_pharm', items: [{ id: '12', name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 30 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 65, pickupSlot: 's2', status: 'completed', paymentMethod: 'Wallet', createdAt: fmt(12, 20) },
    { orderId: 'SC-1012', username: 'ananya_cs', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 1, price: 70 }], totalAmount: 70, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 21) },
    { orderId: 'SC-1013', username: 'suresh_mech', items: [{ id: '6', name: 'Vada Pav', quantity: 3, price: 20 }], totalAmount: 60, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 22) },
    { orderId: 'SC-1014', username: 'pooja_ece', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }], totalAmount: 60, pickupSlot: 's2', status: 'completed', paymentMethod: 'Card', createdAt: fmt(12, 23) },
    { orderId: 'SC-1015', username: 'harish_it', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }, { id: '9', name: 'Masala Chai', quantity: 1, price: 15 }], totalAmount: 105, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 24) },
    { orderId: 'SC-1016', username: 'deepa_cse', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }], totalAmount: 80, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 25) },
    { orderId: 'SC-1017', username: 'manoj_civil', items: [{ id: '7', name: 'Samosa (2 pcs)', quantity: 2, price: 25 }], totalAmount: 50, pickupSlot: 's2', status: 'completed', paymentMethod: 'Wallet', createdAt: fmt(12, 26) },
    { orderId: 'SC-1018', username: 'kavya_bio', items: [{ id: '5', name: 'Masala Dosa', quantity: 1, price: 40 }, { id: '11', name: 'Fresh Lime Soda', quantity: 1, price: 25 }], totalAmount: 65, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 27) },
    { orderId: 'SC-1019', username: 'naveen_eee', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 1, price: 70 }], totalAmount: 70, pickupSlot: 's2', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 28) },
    { orderId: 'SC-1020', username: 'sangeetha_mba', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's2', status: 'completed', paymentMethod: 'Card', createdAt: fmt(12, 29) },

    { orderId: 'SC-1021', username: 'bharath_cs', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }], totalAmount: 60, pickupSlot: 's3', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 31) },
    { orderId: 'SC-1022', username: 'revathi_ece', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 125, pickupSlot: 's3', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 32) },
    { orderId: 'SC-1023', username: 'gopal_mech', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }], totalAmount: 80, pickupSlot: 's3', status: 'completed', paymentMethod: 'Wallet', createdAt: fmt(12, 33) },
    { orderId: 'SC-1024', username: 'nithya_it', items: [{ id: '5', name: 'Masala Dosa', quantity: 2, price: 40 }, { id: '9', name: 'Masala Chai', quantity: 2, price: 15 }], totalAmount: 110, pickupSlot: 's3', status: 'completed', paymentMethod: 'UPI', createdAt: fmt(12, 34) },
    { orderId: 'SC-1025', username: 'balaji_civil', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 1, price: 70 }], totalAmount: 70, pickupSlot: 's3', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 35) },
    { orderId: 'SC-1026', username: 'ishwarya_cse', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's3', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(12, 36) },
    { orderId: 'SC-1027', username: 'pandian_eee', items: [{ id: '7', name: 'Samosa (2 pcs)', quantity: 2, price: 25 }, { id: '11', name: 'Fresh Lime Soda', quantity: 1, price: 25 }], totalAmount: 75, pickupSlot: 's3', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 37) },
    { orderId: 'SC-1028', username: 'tamil_bio', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }, { id: '12', name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 30 }], totalAmount: 90, pickupSlot: 's3', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 38) },
    { orderId: 'SC-1029', username: 'vignesh_mba', items: [{ id: '6', name: 'Vada Pav', quantity: 2, price: 20 }, { id: '9', name: 'Masala Chai', quantity: 1, price: 15 }], totalAmount: 55, pickupSlot: 's3', status: 'confirmed', paymentMethod: 'Wallet', createdAt: fmt(12, 39) },
    { orderId: 'SC-1030', username: 'pavithra_cs', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }], totalAmount: 80, pickupSlot: 's3', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 40) },

    { orderId: 'SC-1031', username: 'muthu_mech', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 46) },
    { orderId: 'SC-1032', username: 'geetha_ece', items: [{ id: '1', name: 'Veg Thali', quantity: 2, price: 60 }], totalAmount: 120, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(12, 47) },
    { orderId: 'SC-1033', username: 'saravanan_it', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 1, price: 70 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 105, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 48) },
    { orderId: 'SC-1034', username: 'lavanya_cse', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }], totalAmount: 80, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 49) },
    { orderId: 'SC-1035', username: 'dinesh_civil', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }, { id: '9', name: 'Masala Chai', quantity: 2, price: 15 }], totalAmount: 120, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'Wallet', createdAt: fmt(12, 50) },
    { orderId: 'SC-1036', username: 'saranya_bio', items: [{ id: '5', name: 'Masala Dosa', quantity: 1, price: 40 }], totalAmount: 40, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 51) },
    { orderId: 'SC-1037', username: 'venkat_eee', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }, { id: '11', name: 'Fresh Lime Soda', quantity: 1, price: 25 }], totalAmount: 85, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 52) },
    { orderId: 'SC-1038', username: 'jayanthi_mba', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(12, 53) },
    { orderId: 'SC-1039', username: 'mani_cs', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }, { id: '12', name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 30 }], totalAmount: 110, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 54) },
    { orderId: 'SC-1040', username: 'chitra_mech', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 1, price: 70 }], totalAmount: 70, pickupSlot: 's4', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(12, 55) },

    { orderId: 'SC-1041', username: 'raj_cse', items: [{ id: '2', name: 'Chicken Biryani', quantity: 2, price: 90 }], totalAmount: 180, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 1) },
    { orderId: 'SC-1042', username: 'shanthi_ece', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }, { id: '9', name: 'Masala Chai', quantity: 1, price: 15 }], totalAmount: 75, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 2) },
    { orderId: 'SC-1043', username: 'praveen_it', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 115, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(13, 3) },
    { orderId: 'SC-1044', username: 'uma_civil', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 4) },
    { orderId: 'SC-1045', username: 'ganesh_bio', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 2, price: 70 }, { id: '11', name: 'Fresh Lime Soda', quantity: 2, price: 25 }], totalAmount: 190, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'Wallet', createdAt: fmt(13, 5) },
    { orderId: 'SC-1046', username: 'anbu_eee', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }], totalAmount: 60, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 6) },
    { orderId: 'SC-1047', username: 'selvi_mba', items: [{ id: '5', name: 'Masala Dosa', quantity: 2, price: 40 }, { id: '9', name: 'Masala Chai', quantity: 2, price: 15 }], totalAmount: 110, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 7) },
    { orderId: 'SC-1048', username: 'kiran_cs', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }, { id: '12', name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 30 }], totalAmount: 120, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 8) },
    { orderId: 'SC-1049', username: 'padma_mech', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }], totalAmount: 80, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(13, 9) },
    { orderId: 'SC-1050', username: 'bala_ece', items: [{ id: '6', name: 'Vada Pav', quantity: 3, price: 20 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 95, pickupSlot: 's5', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 10) },

    { orderId: 'SC-1051', username: 'ranjith_it', items: [{ id: '1', name: 'Veg Thali', quantity: 1, price: 60 }, { id: '9', name: 'Masala Chai', quantity: 1, price: 15 }], totalAmount: 75, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 16) },
    { orderId: 'SC-1052', username: 'vanitha_cse', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 17) },
    { orderId: 'SC-1053', username: 'sudha_civil', items: [{ id: '4', name: 'Egg Fried Rice', quantity: 1, price: 70 }, { id: '12', name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 30 }], totalAmount: 100, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(13, 18) },
    { orderId: 'SC-1054', username: 'karthi_eee', items: [{ id: '3', name: 'Paneer Butter Masala + Roti', quantity: 1, price: 80 }, { id: '10', name: 'Cold Coffee', quantity: 1, price: 35 }], totalAmount: 115, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'Wallet', createdAt: fmt(13, 19) },
    { orderId: 'SC-1055', username: 'mythili_bio', items: [{ id: '2', name: 'Chicken Biryani', quantity: 1, price: 90 }], totalAmount: 90, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 20) },
    { orderId: 'SC-1056', username: 'senthil_mba', items: [{ id: '5', name: 'Masala Dosa', quantity: 1, price: 40 }, { id: '11', name: 'Fresh Lime Soda', quantity: 2, price: 25 }], totalAmount: 90, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 21) },
    { orderId: 'SC-1057', username: 'devi_cs', items: [{ id: '1', name: 'Veg Thali', quantity: 2, price: 60 }], totalAmount: 120, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'UPI', createdAt: fmt(13, 22) },
    { orderId: 'SC-1058', username: 'abishek_mech', items: [{ id: '7', name: 'Samosa (2 pcs)', quantity: 2, price: 25 }, { id: '9', name: 'Masala Chai', quantity: 2, price: 15 }], totalAmount: 80, pickupSlot: 's6', status: 'confirmed', paymentMethod: 'Card', createdAt: fmt(13, 23) }
  ];

  const normalized = mockOrders.map((order) => ({
    ...order,
    id: order.orderId,
    status: String(order.status || 'confirmed').toLowerCase(),
    timestamp: order.createdAt,
    date: new Date(order.createdAt).toLocaleDateString('en-CA'),
    time: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    slot: slotIdToLabel[order.pickupSlot] || order.pickupSlot,
    totalPrice: order.totalAmount,
    studentName: order.username,
    studentId: order.username,
    items: (order.items || []).map((item) => {
      const quantity = Number(item.quantity || item.qty || 1);
      return {
        ...item,
        quantity,
        qty: quantity
      };
    })
  }));

  localStorage.setItem('sc_orders', JSON.stringify(normalized));
}

seedMockDataIfEmpty();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <PortalProvider>
            <Suspense fallback={<PageLoader />}>
              <App />
            </Suspense>
          </PortalProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
