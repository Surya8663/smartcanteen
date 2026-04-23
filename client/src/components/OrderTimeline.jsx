import React, { useState, useEffect } from 'react';

export default function OrderTimeline({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState('placed');

  useEffect(() => {
    if (!order) return;
    
    const orderTime = new Date(order.date + 'T' + order.time);
    const now = new Date();
    const minsElapsed = (now - orderTime) / (1000 * 60);

    if (minsElapsed < 5) {
      setStatus('placed');
    } else if (minsElapsed < 15) {
      setStatus('preparing');
    } else if (minsElapsed < 30) {
      setStatus('ready');
    } else {
      setStatus('completed');
    }
  }, [order]);

  const timeline = [
    {
      id: 'placed',
      label: 'Order Placed',
      icon: '✅',
      time: order?.time || '12:03 PM'
    },
    {
      id: 'preparing',
      label: 'Preparing your food...',
      icon: '🔄',
      time: order?.time ? new Date(new Date(order.date + 'T' + order.time).getTime() + 2 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:05 PM'
    },
    {
      id: 'ready',
      label: 'Ready for Pickup',
      icon: '🍽️',
      time: order?.time ? new Date(new Date(order.date + 'T' + order.time).getTime() + 11 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:14 PM'
    },
    {
      id: 'completed',
      label: 'Picked Up',
      icon: '✅',
      time: order?.time ? new Date(new Date(order.date + 'T' + order.time).getTime() + 25 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:28 PM'
    }
  ];

  const statusIndex = timeline.findIndex(s => s.id === status);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex justify-between items-center transition"
      >
        <span className="font-medium text-gray-900">Order Timeline</span>
        <span className="text-gray-600">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {timeline.map((step, idx) => (
            <div key={step.id} className="flex gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    idx < statusIndex
                      ? 'bg-green-500 text-white'
                      : idx === statusIndex
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {idx < statusIndex ? '✓' : step.icon}
                </div>
                {idx < timeline.length - 1 && (
                  <div className={`w-1 h-8 mt-1 ${idx < statusIndex ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 pb-2">
                <p className={`font-medium ${idx < statusIndex ? 'text-gray-600' : idx === statusIndex ? 'text-orange-600' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
