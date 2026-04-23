import React, { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const lunchStart = 12 * 60;

      if (currentMinutes < lunchStart) {
        const minutesUntil = lunchStart - currentMinutes;
        const hours = Math.floor(minutesUntil / 60);
        const mins = minutesUntil % 60;
        const secs = 60 - now.getSeconds();
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-2">Canteen opens in</p>
      <div className="bg-orange-100 rounded-lg p-4 font-mono text-3xl font-bold text-orange-600 tracking-wider">
        {timeLeft}
      </div>
    </div>
  );
}
