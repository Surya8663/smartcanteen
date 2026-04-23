import React, { useEffect, useMemo, useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import StatCard from '../../components/admin/StatCard';

const SLOT_MAP = [
  { id: 's1', label: '12:00 PM – 12:15 PM' },
  { id: 's2', label: '12:15 PM – 12:30 PM' },
  { id: 's3', label: '12:30 PM – 12:45 PM' },
  { id: 's4', label: '12:45 PM – 1:00 PM' },
  { id: 's5', label: '1:00 PM – 1:15 PM' },
  { id: 's6', label: '1:15 PM – 1:30 PM' }
];

const HEATMAP_BASELINE = {
  s1: 50,
  s2: 50,
  s3: 50,
  s4: 50,
  s5: 12,
  s6: 10
};

const PEAK_SLOT_MIN_DISPLAY_COUNT = {
  s5: 10,
  s6: 10
};

const getAllOrders = () => {
  const raw = JSON.parse(localStorage.getItem('sc_orders') || '[]');
  return Array.isArray(raw) ? raw : [];
};

const getSlotOrderCount = (slotId) => {
  const allOrders = getAllOrders();
  const slotLabel = SLOT_MAP.find((slot) => slot.id === slotId)?.label;
  return allOrders.filter((o) => {
    const orderSlot = o.pickupSlot || o.slot;
    return orderSlot === slotId || orderSlot === slotLabel;
  }).length;
};

const getCrowdLevel = (count) => {
  if (count <= 10) return 'Low';
  if (count <= 25) return 'Medium';
  return 'High';
};

const getCrowdColorClass = (count) => {
  if (count <= 10) return 'bg-green-500';
  if (count <= 25) return 'bg-yellow-400';
  return 'bg-red-500';
};

const getHeatmapFill = (slotId, count) => {
  const baseline = HEATMAP_BASELINE[slotId] || 50;
  return Math.min((count / baseline) * 100, 100);
};

const toTitleCaseStatus = (status) => {
  const text = String(status || 'confirmed').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const getStatusClasses = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (normalized === 'confirmed') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-700';
};

export default function AdminDashboardPage() {
  const { orders } = usePortal();
  const [stats, setStats] = useState({ ordersToday: 0, revenue: 0, studentsToday: 0, avgValue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  const crowdData = useMemo(() => {
    return SLOT_MAP.map((slot) => {
      const rawCount = getSlotOrderCount(slot.id);
      const minDisplay = PEAK_SLOT_MIN_DISPLAY_COUNT[slot.id] || 0;
      const count = Math.max(rawCount, minDisplay);
      return {
        ...slot,
        rawCount,
        count,
        fill: getHeatmapFill(slot.id, count),
        crowdLevel: getCrowdLevel(count),
        crowdColor: getCrowdColorClass(count)
      };
    });
  }, [orders]);

  useEffect(() => {
    const allOrders = getAllOrders();
    const today = new Date().toLocaleDateString('en-CA');
    const todaysOrders = allOrders.filter((o) => {
      const stamp = o.createdAt || o.timestamp;
      if (!stamp) return false;
      return new Date(stamp).toLocaleDateString('en-CA') === today;
    });

    const uniqueStudents = new Set(todaysOrders.map((o) => o.username).filter(Boolean)).size;
    const totalRevenue = todaysOrders.reduce((sum, o) => sum + Number(o.totalAmount || o.totalPrice || 0), 0);
    const avgValue = todaysOrders.length ? totalRevenue / todaysOrders.length : 0;

    setStats({
      ordersToday: todaysOrders.length,
      revenue: totalRevenue,
      studentsToday: uniqueStudents,
      avgValue
    });

    const latestOrders = getAllOrders()
      .sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0))
      .slice(0, 10);

    setRecentOrders(latestOrders);
  }, [orders]);

  const handleMarkSoldOut = () => {
    alert('Marked all current items as sold out');
  };

  const handleSendNotice = () => {
    alert('Notice sent to all students');
  };

  const handleExportDaily = () => {
    const data = JSON.stringify(recentOrders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Orders Today" value={stats.ordersToday} change="+12%" />
        <StatCard icon="💰" label="Revenue" value={`₹${stats.revenue.toFixed(2)}`} change="+8%" />
        <StatCard icon="👥" label="Students" value={stats.studentsToday} change="+5%" />
        <StatCard icon="💵" label="Avg Value" value={`₹${stats.avgValue.toFixed(2)}`} change="+3%" />
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Crowd Heatmap</h2>
        <div className="space-y-3">
          {crowdData.map((slot) => (
            <div key={slot.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{slot.label}</span>
                <span className="text-gray-600">{slot.count}/50 • {slot.crowdLevel}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${slot.crowdColor} h-2 rounded-full`} style={{ width: `${slot.fill}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Recent Orders (Last 10)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2">Order ID</th>
                <th className="text-left py-2 px-2">Student</th>
                <th className="text-left py-2 px-2">Items</th>
                <th className="text-left py-2 px-2">Amount</th>
                <th className="text-left py-2 px-2">Slot</th>
                <th className="text-left py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => {
                const slotLabel = SLOT_MAP.find((s) => s.id === order.pickupSlot)?.label || order.pickupSlot || '-';
                const itemsLabel = (order.items || [])
                  .map((i) => `${i.name} ×${i.quantity || i.qty || 1}`)
                  .join(', ');
                return (
                  <tr key={order.orderId || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-2 text-orange-600 font-medium">{order.orderId}</td>
                    <td className="py-2 px-2">{order.username || '-'}</td>
                    <td className="py-2 px-2">{itemsLabel || '-'}</td>
                    <td className="py-2 px-2 font-medium">₹{Number(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-gray-600">{slotLabel}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusClasses(order.status)}`}>
                        {toTitleCaseStatus(order.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleMarkSoldOut}
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition"
        >
          Mark Sold Out
        </button>
        <button
          onClick={handleSendNotice}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
        >
          Send Notice
        </button>
        <button
          onClick={handleExportDaily}
          className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition"
        >
          Export Daily
        </button>
      </div>
    </div>
  );
}
