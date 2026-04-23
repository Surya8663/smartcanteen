import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortal } from '../context/PortalContext';
import NoticeBoard from '../components/NoticeBoard';
import { storage } from '../utils/storage';
import { menuItems, pickupSlots } from '../data/mockData';

const SLOT_CAPACITY = 50;

const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const toMinutes = (slotLabel) => {
  const [time, meridian] = slotLabel.trim().split(' ');
  let [hour, minute] = time.split(':').map(Number);
  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const slotRangeToMinutes = (label) => {
  const [startLabel, endLabel] = label.split('–').map((part) => part.trim());
  return {
    start: toMinutes(startLabel),
    end: toMinutes(endLabel)
  };
};

const getCrowdConfig = (level) => {
  if (level === 'high') {
    return {
      ring: 'border-red-400',
      status: 'HIGH CROWD',
      emoji: '😰',
      subtitle: 'Canteen is very busy right now.',
      colorText: 'text-red-300'
    };
  }

  if (level === 'medium') {
    return {
      ring: 'border-yellow-400',
      status: 'MODERATE CROWD',
      emoji: '😐',
      subtitle: 'Moderate crowd, still manageable.',
      colorText: 'text-yellow-300'
    };
  }

  return {
    ring: 'border-green-400',
    status: 'LOW CROWD',
    emoji: '😌',
    subtitle: 'Great time to visit!',
    colorText: 'text-green-300'
  };
};

const calculateFallbackCrowd = (orders) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slotCounts = pickupSlots.map((slot) => {
    const range = slotRangeToMinutes(slot.label);
    const count = orders.filter((order) => (order.pickupSlot || order.slot) === slot.label).length;
    return {
      ...slot,
      ...range,
      count
    };
  });

  const activeSlot =
    slotCounts.find((slot) => currentMinutes >= slot.start && currentMinutes < slot.end) || slotCounts[0];

  const crowdLevel = activeSlot.count < 10 ? 'low' : activeSlot.count <= 25 ? 'medium' : 'high';
  const waitTime = crowdLevel === 'low' ? '~5 min' : crowdLevel === 'medium' ? '~12 min' : '~20 min';
  const bestSlot = slotCounts.reduce((min, slot) => (slot.count < min.count ? slot : min), slotCounts[0]);

  return {
    crowdLevel,
    estimatedPeople: activeSlot.count,
    waitTime,
    recommendation:
      crowdLevel === 'high'
        ? `⚠️ Canteen is packed right now. Try visiting at ${bestSlot.label} instead.`
        : `✨ Now is a great time! Recommended slot: ${activeSlot.label}`,
    updatedAt: new Date().toISOString(),
    source: 'orders',
    activeSlot: activeSlot.label,
    bestSlot: bestSlot.label,
    safeToVisit: crowdLevel !== 'high'
  };
};

const formatUpdatedSince = (isoDate) => {
  if (!isoDate) return 'Updated just now';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return 'Updated just now';
  return `Updated ${mins} min${mins > 1 ? 's' : ''} ago`;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { points, orders } = usePortal();
  const [liveCrowdStatus, setLiveCrowdStatus] = useState(() => storage.get('sc_crowd_status', null));
  const [displayStats, setDisplayStats] = useState({ orders: 0, points: 0, streak: 0, freeMeals: 0 });

  const today = new Date().toLocaleDateString('en-CA');
  const todayOrders = orders.filter((o) => o.date === today);
  const streak = Number(localStorage.getItem('sc_streak') || '0');
  const greeting = getGreeting();

  const pointsTotal = Number(points?.total || 0);
  const pointsHistory = points?.history || [];
  const freeMealsClaimed = pointsHistory.filter((entry) => entry.type === 'redeem' || Number(entry.points) < 0).length;
  const pointsToFreeMeal = Math.max(0, 100 - pointsTotal);
  const ringProgress = Math.min(100, pointsTotal);

  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringProgress / 100) * ringCircumference;

  const targetStats = useMemo(
    () => ({
      orders: todayOrders.length,
      points: pointsTotal,
      streak,
      freeMeals: freeMealsClaimed
    }),
    [todayOrders.length, pointsTotal, streak, freeMealsClaimed]
  );

  const menuFromStorage = storage.get('sc_menu', menuItems);
  const showcaseItems = (Array.isArray(menuFromStorage) && menuFromStorage.length > 0 ? menuFromStorage : menuItems)
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price
    }));

  const doubledMenu = [...showcaseItems, ...showcaseItems];

  const crowdData = useMemo(() => {
    if (liveCrowdStatus) {
      return {
        ...liveCrowdStatus,
        source: 'ai',
        activeSlot: liveCrowdStatus.activeSlot || '12:00 PM – 12:15 PM',
        bestSlot: liveCrowdStatus.bestSlot || '12:00 PM – 12:15 PM'
      };
    }

    return calculateFallbackCrowd(todayOrders);
  }, [liveCrowdStatus, todayOrders]);

  const crowdVisual = getCrowdConfig(crowdData.crowdLevel);

  useEffect(() => {
    const syncCrowdStatus = () => {
      setLiveCrowdStatus(storage.get('sc_crowd_status', null));
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === 'sc_crowd_status') {
        syncCrowdStatus();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sc-crowd-status-updated', syncCrowdStatus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sc-crowd-status-updated', syncCrowdStatus);
    };
  }, []);

  useEffect(() => {
    const duration = 1000;
    const frameMs = 25;
    const steps = Math.max(1, Math.floor(duration / frameMs));
    let currentStep = 0;

    const timer = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(1, currentStep / steps);

      setDisplayStats({
        orders: Math.round(targetStats.orders * progress),
        points: Math.round(targetStats.points * progress),
        streak: Math.round(targetStats.streak * progress),
        freeMeals: Math.round(targetStats.freeMeals * progress)
      });

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, frameMs);

    return () => window.clearInterval(timer);
  }, [targetStats]);

  return (
    <div className="page-enter bg-[linear-gradient(180deg,#fff_0%,#fff9f5_100%)]">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-8 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#FF6B35] to-[#ff9a5c] p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">Student Dashboard</p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                {greeting}, {user?.username || 'Student'} 👋
              </h1>
              <p className="mt-2 text-base text-white/80 sm:text-lg">What are you having today?</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/student/menu"
                  className="rounded-full bg-white px-6 py-3 text-sm font-bold text-brand shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  🍽️ Order Now
                </Link>
                <Link
                  to="/student/orders"
                  className="rounded-full border border-white/80 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  📋 My Orders
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute left-[10%] top-4 text-6xl food-float-a">🍛</div>
              <div className="absolute right-[20%] top-10 text-6xl food-float-b">🥗</div>
              <div className="absolute left-[32%] top-24 text-6xl food-float-c">☕</div>
              <div className="absolute right-[8%] top-32 text-6xl food-float-d">🍩</div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_40%)]" />
        </div>

        <div className="relative z-10 -mt-10 px-2 sm:px-6">
          <div className="shimmer-card grid gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl sm:grid-cols-3 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <div className="text-sm font-semibold text-navy/70">Current Streak</div>
                <div className="text-xl font-black text-navy">{streak} Day Streak!</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 88 88" fill="none">
                  <circle cx="44" cy="44" r={ringRadius} stroke="rgba(255,255,255,0.35)" strokeWidth="8" />
                  <circle
                    cx="44"
                    cy="44"
                    r={ringRadius}
                    stroke="#FF6B35"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-sm font-black text-navy">{ringProgress}%</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 text-right">
              <div>
                <div className="text-sm font-semibold text-navy/70">Reward Progress</div>
                <div className="text-xl font-black text-navy">{pointsToFreeMeal} pts to free meal</div>
              </div>
              <span className="text-3xl">🎁</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <NoticeBoard />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: '🛒', label: 'Orders Placed', value: displayStats.orders },
            { icon: '⭐', label: 'Mess Points', value: displayStats.points },
            { icon: '🔥', label: 'Day Streak', value: displayStats.streak },
            { icon: '🎟️', label: 'Free Meals Claimed', value: displayStats.freeMeals }
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand text-xl text-white">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-navy">{stat.value}</div>
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-600">{stat.label}</div>
              <div className="mt-3 h-1 w-0 rounded-full bg-brand transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-navy">Today's Menu ✨</h2>
            <Link to="/student/menu" className="text-sm font-semibold text-brand hover:text-brand/80">
              View All →
            </Link>
          </div>

          <div className="carousel-wrapper space-y-4 overflow-hidden">
            <div className="scroll-left gap-4">
              {doubledMenu.map((item, index) => (
                <div
                  key={`left-${item.id}-${index}`}
                  className="w-40 shrink-0 rounded-xl border border-slate-200 bg-white p-3 transition hover:scale-[1.03]"
                >
                  <img src={item.imageUrl} alt={item.name} className="h-24 w-full rounded-lg object-cover" />
                  <div className="mt-2 text-xs font-bold text-navy line-clamp-2">{item.name}</div>
                  <span className="mt-2 inline-flex rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                    ₹{item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="scroll-right gap-4">
              {doubledMenu.map((item, index) => (
                <div
                  key={`right-${item.id}-${index}`}
                  className="w-40 shrink-0 rounded-xl border border-slate-200 bg-white p-3 transition hover:scale-[1.03]"
                >
                  <img src={item.imageUrl} alt={item.name} className="h-24 w-full rounded-lg object-cover" />
                  <div className="mt-2 text-xs font-bold text-navy line-clamp-2">{item.name}</div>
                  <span className="mt-2 inline-flex rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                    ₹{item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl crowd-card-bg text-white shadow-xl">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr] lg:p-8">
            <div>
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                <span>🎥 Live Canteen Status</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" /> REC
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center lg:items-start">
                <div className="relative grid h-28 w-28 place-items-center rounded-full border-2 border-white/25 bg-white/5">
                  <span className={`ripple-ring inset-0 border ${crowdVisual.ring}`} />
                  <span className={`ripple-ring inset-0 border ${crowdVisual.ring}`} />
                  <span className="text-4xl">{crowdVisual.emoji}</span>
                </div>

                <div className={`mt-4 text-xl font-black uppercase tracking-[0.15em] ${crowdVisual.colorText}`}>
                  {crowdVisual.status}
                </div>
                <div className="mt-2 text-sm text-white/80">{crowdVisual.subtitle}</div>
                <div className="mt-2 text-sm font-semibold text-white/90">{crowdData.waitTime || '~5 min'} wait</div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-black/15 p-4">
              <div className="text-sm text-white/85">👥 ~{crowdData.estimatedPeople || 0} people</div>
              <div className="text-sm text-white/85">
                {crowdData.crowdLevel === 'high' ? '⚠️ Peak crowd. Better to delay your visit.' : '✨ Now is a great time!'}
              </div>
              <div className="text-sm text-white/70">{formatUpdatedSince(crowdData.updatedAt)}</div>
              <div className="text-xs text-white/55">🤖 Powered by Claude AI Vision</div>

              <div className="mt-4 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm">
                Recommended slot: {crowdData.bestSlot || crowdData.activeSlot || '12:00 PM – 12:15 PM'}{' '}
                {crowdData.crowdLevel === 'high' ? '🔴' : crowdData.crowdLevel === 'medium' ? '🟡' : '🟢'}
              </div>

              {crowdData.crowdLevel === 'high' ? (
                <div className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-red-100">
                  ⚠️ Canteen is packed right now. Try visiting at {crowdData.bestSlot || '1:15 PM'} instead.
                </div>
              ) : null}

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                <span className={`h-2 w-2 rounded-full ${crowdData.source === 'ai' ? 'bg-emerald-400' : 'bg-blue-300'} animate-pulse`} />
                {crowdData.source === 'ai' ? '📡 AI Vision Active' : '📊 Based on order data'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link to="/student/menu" className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition">
            <div className="text-3xl">🛒</div>
            <div className="mt-3 text-lg font-bold text-gray-900">Browse Menu</div>
            <p className="mt-1 text-sm text-gray-600">Build your order</p>
          </Link>
          <Link to="/student/orders" className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition">
            <div className="text-3xl">📋</div>
            <div className="mt-3 text-lg font-bold text-gray-900">My Orders: {todayOrders.length}</div>
            <p className="mt-1 text-sm text-gray-600">Today's orders</p>
          </Link>
          <Link to="/student/leaderboard" className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition">
            <div className="text-3xl">👑</div>
            <div className="mt-3 text-lg font-bold text-gray-900">Leaderboard</div>
            <p className="mt-1 text-sm text-gray-600">See top ranking</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
