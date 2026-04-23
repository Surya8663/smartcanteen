import React, { useState, useEffect } from 'react';

export default function PointsRing({ points = 0, maxPoints = 100 }) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPoints / maxPoints) * circumference;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < points) {
        current += Math.ceil((points - current) / 10);
        setDisplayPoints(Math.min(current, points));
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [points]);

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="6"
          opacity="0.2"
        />
        {/* Progress ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#FF6B35"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-orange-600">{displayPoints}</p>
        <p className="text-xs text-gray-600">/ {maxPoints} pts</p>
      </div>
    </div>
  );
}
