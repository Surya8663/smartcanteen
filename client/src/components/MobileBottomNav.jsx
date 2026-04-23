import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount } = usePortal();

  const navItems = [
    { label: 'Home', icon: '🏠', path: '/student/dashboard' },
    { label: 'Menu', icon: '🍽️', path: '/student/menu' },
    { label: 'Orders', icon: '📋', path: '/student/orders' },
    { label: 'Points', icon: '⭐', path: '/student/mess-points' },
    { label: 'Rank', icon: '👑', path: '/student/leaderboard' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full relative transition ${
                isActive ? 'text-orange-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
              {item.label === 'Menu' && cartCount > 0 && (
                <div className="absolute top-0 right-1/4 transform translate-x-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
