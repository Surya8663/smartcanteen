import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortal } from '../context/PortalContext';
import { storage } from '../utils/storage';

const studentLinks = [
  { label: 'Home', href: '/student/dashboard' },
  { label: 'Menu', href: '/student/menu' },
  { label: 'My Orders', href: '/student/orders' },
  { label: 'Mess Points', href: '/student/mess-points' }
];

const adminLinks = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Manage Menu', href: '/admin/dashboard#menu' },
  { label: 'Orders', href: '/admin/dashboard#orders' },
  { label: 'Analytics', href: '/admin/dashboard#analytics' }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const isReloadingRef = useRef(false);
  const { user, logout } = useAuth();
  const { cartCount, openCart } = usePortal();
  const navigate = useNavigate();

  const role = user?.role || 'student';
  const links = role === 'admin' ? adminLinks : studentLinks;

  // Dark mode setup
  useEffect(() => {
    const savedTheme = storage.get('sc_theme', 'light');
    setIsDark(savedTheme === 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handlePWAInstallAvailable = (e) => {
      setDeferredPrompt(e.detail.deferredPrompt);
      setShowInstall(true);
    };

    window.addEventListener('pwa-install-available', handlePWAInstallAvailable);
    return () => window.removeEventListener('pwa-install-available', handlePWAInstallAvailable);
  }, []);

  // Service worker update detection for instant refresh.
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!('serviceWorker' in navigator)) return;

    const showUpdate = (worker) => {
      if (!worker) return;
      setWaitingWorker(worker);
      setShowUpdateBanner(true);
    };

    const handleControllerChange = () => {
      if (isReloadingRef.current) return;
      isReloadingRef.current = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration.waiting) {
          showUpdate(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdate(newWorker);
            }
          });
        });
      })
      .catch(() => {
        // Silent fail: app should continue even if SW registration errors.
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Scroll effect for landing page
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    storage.set('sc_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  const handleRefreshForUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {showUpdateBanner ? (
        <div className="fixed inset-x-0 top-3 z-[60] mx-auto w-[92%] max-w-xl rounded-2xl border border-brand/40 bg-white px-4 py-3 shadow-soft">
          <button
            type="button"
            onClick={handleRefreshForUpdate}
            className="w-full text-left text-sm font-semibold text-brand transition hover:text-brand/80"
          >
            🔄 App update available! Click to refresh
          </button>
        </div>
      ) : null}

      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled || user
          ? 'border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm'
          : 'border-transparent bg-transparent'
      }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-navy">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-xl text-white shadow-soft">
            🍽️
          </span>
          <span>SmartCanteen</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-brand/10 hover:text-brand'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {showInstall && deferredPrompt && role === 'student' && (
            <button
              onClick={handleInstallApp}
              className="rounded-full border border-brand bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/20"
            >
              📲 Install App
            </button>
          )}
          {role === 'student' && (
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-navy transition hover:scale-105 hover:border-brand hover:text-brand"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          )}
          {role === 'student' ? (
            <button
              type="button"
              onClick={openCart}
              className="relative rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:scale-105 hover:border-brand hover:text-brand"
            >
              <span className="mr-2">🛒</span>
              Cart
              {cartCount > 0 ? (
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 capitalize">
              {role} view
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand"
          >
            Logout
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 p-3 text-slate-700 shadow-sm transition hover:border-brand/40 hover:text-brand lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span className="sr-only">Toggle menu</span>
          <span className="text-lg">{isOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 pt-4">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {role === 'student' ? (
              <>
                {showInstall && deferredPrompt && (
                  <button
                    onClick={handleInstallApp}
                    className="rounded-2xl border border-brand bg-brand/10 px-4 py-3 text-left text-sm font-semibold text-brand transition hover:bg-brand/20"
                  >
                    📲 Install App
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
                >
                  {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openCart();
                    setIsOpen(false);
                  }}
                  className="rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3 text-left text-sm font-semibold text-brand"
                >
                  Open Cart {cartCount > 0 ? `(${cartCount})` : ''}
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-navy px-4 py-3 text-left text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
      </header>
    </>
  );
};

export default Navbar;
