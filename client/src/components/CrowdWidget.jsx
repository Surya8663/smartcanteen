import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export default function CrowdWidget() {
  const [crowdLevel, setCrowdLevel] = useState('low');
  const [activeSlot, setActiveSlot] = useState(null);
  const [isCanteenOpen, setIsCanteenOpen] = useState(false);
  const [timeUntilOpen, setTimeUntilOpen] = useState('');
  const [waitTime, setWaitTime] = useState('~5 min');
  const [capacity, setCapacity] = useState(0);
  const [bestSlot, setBestSlot] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [liveBroadcast, setLiveBroadcast] = useState(() => storage.get('sc_crowd_status', null));

  const pickupSlots = [
    { id: 's1', time: '12:00–12:15', start: 12 * 60, end: 12 * 60 + 15 },
    { id: 's2', time: '12:15–12:30', start: 12 * 60 + 15, end: 12 * 60 + 30 },
    { id: 's3', time: '12:30–12:45', start: 12 * 60 + 30, end: 12 * 60 + 45 },
    { id: 's4', time: '12:45–13:00', start: 12 * 60 + 45, end: 13 * 60 },
    { id: 's5', time: '13:00–13:15', start: 13 * 60, end: 13 * 60 + 15 },
    { id: 's6', time: '13:15–13:30', start: 13 * 60 + 15, end: 13 * 60 + 30 }
  ];

  const refreshCrowdData = () => {
    const broadcast = storage.get('sc_crowd_status', null);
    setLiveBroadcast(broadcast);

    if (broadcast && broadcast.crowdLevel) {
      setIsCanteenOpen(true);
      setActiveSlot({ time: 'Live AI Detection', orderCount: broadcast.estimatedPeople || 0 });
      setCrowdLevel(broadcast.crowdLevel);
      setCapacity(Math.min(100, Math.max(0, Math.round(((broadcast.estimatedPeople || 0) / 50) * 100))));
      setWaitTime(broadcast.waitTime || '~5 min');
      setBestSlot(null);
      setTimeUntilOpen('');
      setLastUpdated(0);
      return;
    }

    const orders = JSON.parse(localStorage.getItem('sc_orders') || '[]');
    const today = new Date().toLocaleDateString('en-CA');
    const todayOrders = orders.filter(o => o.date === today);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const lunchStart = 12 * 60;
    const lunchEnd = 13 * 60 + 30;

    if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
      setIsCanteenOpen(true);

      const slotData = pickupSlots.map(slot => {
        const count = todayOrders.filter(o => o.slot === slot.time).length;
        return { ...slot, orderCount: count };
      });

      const activeSlotData = slotData.find(s => currentMinutes >= s.start && currentMinutes < s.end) || slotData[0];
      setActiveSlot(activeSlotData);

      const level = activeSlotData.orderCount <= 10 ? 'low' : activeSlotData.orderCount <= 25 ? 'medium' : 'high';
      setCrowdLevel(level);
      setCapacity(Math.round((activeSlotData.orderCount / 50) * 100));
      setWaitTime(level === 'low' ? '~5 min' : level === 'medium' ? '~12 min' : '~20 min');

      const best = slotData.reduce((min, s) => s.orderCount < min.orderCount ? s : min);
      setBestSlot(best);
      setLastUpdated(0);
    } else {
      setIsCanteenOpen(false);
      const closeTime = currentMinutes < lunchStart ? lunchStart : lunchStart + 24 * 60;
      const minutesUntil = (closeTime - currentMinutes) % (24 * 60);
      const hours = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      setTimeUntilOpen(`${hours}:${mins.toString().padStart(2, '0')}`);
    }
  };

  useEffect(() => {
    refreshCrowdData();
    const interval = setInterval(() => {
      setLastUpdated(prev => prev + 1);
      refreshCrowdData();
    }, 30000);

    const handleLiveCrowdUpdate = () => refreshCrowdData();
    window.addEventListener('storage', handleLiveCrowdUpdate);
    window.addEventListener('sc-crowd-status-updated', handleLiveCrowdUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleLiveCrowdUpdate);
      window.removeEventListener('sc-crowd-status-updated', handleLiveCrowdUpdate);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const bgColor = crowdLevel === 'high' ? 'from-red-500 to-red-600' : crowdLevel === 'medium' ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600';
  const pulseColor = crowdLevel === 'high' ? 'bg-red-500' : crowdLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500';

  if (!isCanteenOpen) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="text-gray-600 text-sm font-medium mb-4">Canteen Status</p>
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-3">Canteen opens at 12:00 PM</p>
          <div className="bg-orange-100 rounded-lg p-4 text-3xl font-bold font-mono text-orange-600">
            {timeUntilOpen}
          </div>
          <p className="text-sm text-gray-600 mt-3">Canteen opens in</p>
          {parseInt(timeUntilOpen.split(':')[0]) === 0 && parseInt(timeUntilOpen.split(':')[1]) < 5 && (
            <p className="text-orange-600 font-semibold mt-2">🍽️ Almost time! Get ready to order</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Crowd Card */}
      <div className={`bg-gradient-to-br ${bgColor} rounded-lg p-6 shadow-lg text-white overflow-hidden relative`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm opacity-90">Right now in {liveBroadcast ? 'Live AI Detection' : activeSlot?.time}</p>
              {liveBroadcast ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-300 animate-pulse" />
                  📡 Live AI Detection
                </span>
              ) : null}
            </div>
            <div className={`w-3 h-3 rounded-full ${pulseColor} animate-pulse`} />
          </div>
          <h2 className="text-4xl font-bold mb-2">
            {crowdLevel === 'high' ? '🔴 High Crowd' : crowdLevel === 'medium' ? '🟡 Medium Crowd' : '🟢 Low Crowd'}
          </h2>
          <p className="text-sm opacity-95 mb-4">{activeSlot?.orderCount || 0} orders / 50 capacity</p>

          {/* Capacity Bar */}
          <div className="mb-4">
            <div className="w-full bg-white bg-opacity-25 rounded-full h-3 overflow-hidden">
              <div className="bg-white h-3 rounded-full" style={{ width: `${capacity}%` }} />
            </div>
          </div>

          {/* Wait Time */}
          <div className="bg-white bg-opacity-20 rounded px-3 py-2 inline-block text-sm font-semibold">
            ⏱️ Est. wait: {waitTime}
          </div>
        </div>
      </div>

      {/* Best Slot Card */}
      {bestSlot && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-medium">✨ Best slot to visit</p>
          <p className="text-lg font-bold text-green-900 mt-1">{bestSlot.time}</p>
          <p className="text-xs text-green-600 mt-1">{bestSlot.orderCount} orders • Only {Math.round((bestSlot.orderCount / 50) * 100)}% full</p>
        </div>
      )}

      {/* Last Updated */}
      <p className="text-xs text-gray-500 text-center">Last updated: {lastUpdated}s ago</p>
    </div>
  );
}
