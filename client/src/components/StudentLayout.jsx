import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import ToastContainer from './Toast';
import MobileBottomNav from './MobileBottomNav';

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fff8f4_100%)] text-navy">
      <Navbar />
      <ToastContainer />
      <CartDrawer />
      <main className="fade-page">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default StudentLayout;
