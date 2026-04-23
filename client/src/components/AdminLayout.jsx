import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../context/AuthContext';
import { readJSON } from '../utils/storage';
import ToastContainer from './Toast';

const navItems = [
  { label: 'Dashboard', icon: '📊', to: '/admin/dashboard' },
  { label: 'Manage Menu', icon: '🍽️', to: '/admin/menu' },
  { label: 'Orders', icon: '📋', to: '/admin/orders' },
  { label: 'Crowd Monitor', icon: '👥', to: '/admin/crowd' },
  { label: 'CCTV Monitor', icon: '🎥', to: '/admin/cctv' },
  { label: 'Analytics', icon: '📈', to: '/admin/analytics' },
  { label: 'Settings', icon: '⚙️', to: '/admin/settings' }
];

const pageTitles = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/menu': 'Manage Menu',
  '/admin/orders': 'Orders Management',
  '/admin/crowd': 'Crowd Monitor',
  '/admin/cctv': 'CCTV Monitor',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings'
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { orders, showToast } = usePortal();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [lastOrderCount, setLastOrderCount] = useState(orders.length);

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/login', { replace: true });
  };

  // Clock update
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Polling for new orders every 10 seconds
  useEffect(() => {
    const pollInterval = window.setInterval(() => {
      const currentOrders = readJSON('sc_orders', []);
      const currentCount = currentOrders.length;
      
      if (currentCount > lastOrderCount) {
        const newOrderCount = currentCount - lastOrderCount;
        showToast(`🔔 ${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`, 'info');
        setLastOrderCount(currentCount);
      }
    }, 10000); // Poll every 10 seconds

    return () => window.clearInterval(pollInterval);
  }, [lastOrderCount]);

  // Auto-refresh dashboard stats every 15 seconds (by triggering a storage event)
  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      // Dispatch a custom event to trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('admin-dashboard-refresh'));
    }, 15000); // Refresh every 15 seconds

    return () => window.clearInterval(refreshInterval);
  }, []);

  const title = pageTitles[location.pathname] || 'Admin';
  const notificationCount = useMemo(
    () => orders.filter((order) => order.status === 'Confirmed').length,
    [orders]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-navy">
      <ToastContainer />

      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-xl bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white shadow-lg md:hidden"
        onClick={() => setIsSidebarOpen((value) => !value)}
      >
        ☰ Menu
      </button>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col bg-[#1a1a2e] p-5 text-white transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-lg">🍽️</div>
          <div>
            <div className="text-lg font-black">SmartCanteen</div>
            <div className="text-xs text-white/70">Admin Console</div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand text-white shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brand text-lg font-black">A</div>
            <div>
              <div className="text-sm font-bold">Admin</div>
              <div className="text-xs text-white/60">System Supervisor</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-navy">{title}</h1>
              <p className="text-sm text-slate-500">Real-time admin controls for SmartCanteen</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                {clock.toLocaleTimeString()}
              </div>
              <button
                type="button"
                className="relative rounded-xl border border-slate-200 bg-white p-3 text-lg text-slate-600 transition hover:scale-105"
              >
                🔔
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <span>System Active</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="fade-page px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
