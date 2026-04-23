import React, { useState, useEffect } from 'react';

export default function AchievementBadges({ points = 0, orderCount = 0 }) {
  const [badges, setBadges] = useState([]);
  const [tooltips, setTooltips] = useState({});

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const lastOrderDate = localStorage.getItem('sc_last_order_date');
    const streak = localStorage.getItem('sc_streak') || '0';
    const orders = JSON.parse(localStorage.getItem('sc_orders') || '[]');
    const categories = new Set(orders.flatMap(o => o.items?.map(i => i.category) || []));

    const allBadges = [
      {
        id: 'first',
        icon: '🥇',
        name: 'First Order',
        unlocked: orderCount >= 1,
        next: 'Order your first meal'
      },
      {
        id: 'streak',
        icon: '🔥',
        name: '5 Orders Streak',
        unlocked: orderCount >= 5,
        next: `${5 - orderCount} more orders`
      },
      {
        id: 'points50',
        icon: '💫',
        name: '50 Points Club',
        unlocked: points >= 50,
        next: `${50 - points} more points`
      },
      {
        id: 'points100',
        icon: '🌟',
        name: '100 Points Legend',
        unlocked: points >= 100,
        next: `${100 - points} more points`
      },
      {
        id: 'variety',
        icon: '🍽️',
        name: 'Meal Variety',
        unlocked: categories.size >= 4,
        next: `${Math.max(0, 4 - categories.size)} more categories`
      }
    ];

    setBadges(allBadges);
    setTooltips(
      allBadges.reduce((acc, b) => {
        acc[b.id] = b.next;
        return acc;
      }, {})
    );
  }, [points, orderCount]);

  return (
    <div className="space-y-4">
      <h3 className="text-gray-900 font-semibold">Achievement Badges</h3>
      <div className="flex gap-4 flex-wrap">
        {badges.map(badge => (
          <div
            key={badge.id}
            className="relative group"
            title={tooltips[badge.id]}
          >
            <div
              className={`text-4xl p-3 rounded-lg transition-transform ${
                badge.unlocked
                  ? 'bg-orange-100 hover:scale-110 animate-pulse'
                  : 'bg-gray-200 grayscale opacity-50'
              }`}
            >
              {badge.icon}
            </div>
            {!badge.unlocked && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {tooltips[badge.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
