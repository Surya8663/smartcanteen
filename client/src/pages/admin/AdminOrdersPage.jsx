import React, { useState, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { usePortal } from '../../context/PortalContext';
import Modal from '../../components/admin/Modal';
import StatusBadge from '../../components/admin/StatusBadge';
import { getOrdersFromStorage, isToday } from '../../utils/adminData';

export default function AdminOrdersPage() {
  const { updateOrders, notify } = usePortal();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [slotFilter, setSlotFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const stored = getOrdersFromStorage() || [];
    const today = new Date().toLocaleDateString('en-CA');
    const todayOrders = stored.filter(o => o.date === today).reverse();
    setOrders(todayOrders);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSlot = slotFilter === 'all' || order.slot === slotFilter;
    return matchesSearch && matchesStatus && matchesSlot;
  });

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    updateOrders(updated);
    notify(`Order status changed to ${newStatus}`, 'success');
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const slots = ['Breakfast (7-9 AM)', 'Mid Morning (9-11 AM)', 'Lunch (12-2 PM)', 'Evening (3-5 PM)', 'Late Evening (5-7 PM)'];
  const statuses = ['Confirmed', 'Completed', 'Cancelled'];

  const summaryStats = {
    confirmed: filteredOrders.filter(o => o.status === 'Confirmed').length,
    completed: filteredOrders.filter(o => o.status === 'Completed').length,
    cancelled: filteredOrders.filter(o => o.status === 'Cancelled').length,
    revenue: filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium">Confirmed</p>
          <p className="text-2xl font-bold text-blue-700">{summaryStats.confirmed}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-700">{summaryStats.completed}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm font-medium">Cancelled</p>
          <p className="text-2xl font-bold text-red-700">{summaryStats.cancelled}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-600 text-sm font-medium">Revenue</p>
          <p className="text-2xl font-bold text-purple-700">₹{summaryStats.revenue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Order ID or Student name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="all">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slot</label>
            <select value={slotFilter} onChange={e => setSlotFilter(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="all">All Slots</option>
              {slots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2">Order ID</th>
              <th className="text-left py-2 px-2">Student</th>
              <th className="text-left py-2 px-2">Items</th>
              <th className="text-left py-2 px-2">Total</th>
              <th className="text-left py-2 px-2">Slot</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-2 text-orange-600 font-medium cursor-pointer hover:underline" onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
                  #{order.id?.slice(0, 6)}
                </td>
                <td className="py-2 px-2">{order.studentName}</td>
                <td className="py-2 px-2">{order.items.length} items</td>
                <td className="py-2 px-2 font-medium">₹{order.totalPrice}</td>
                <td className="py-2 px-2 text-gray-600">{order.slot}</td>
                <td className="py-2 px-2"><StatusBadge status={order.status} /></td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200 transition"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <p className="text-center py-4 text-gray-500">No orders found</p>}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Order Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold text-orange-600">#{selectedOrder.id?.slice(0, 6)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-semibold">{selectedOrder.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Slot</p>
                <p className="font-semibold">{selectedOrder.slot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">₹{selectedOrder.totalPrice}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Items</p>
              <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} x{item.qty}</span>
                    <span className="font-medium">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">QR Code</p>
              <div className="bg-white border border-gray-200 rounded p-3 flex justify-center">
                <QRCode value={JSON.stringify({ id: selectedOrder.id, student: selectedOrder.studentName })} size={150} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Update Status</label>
              <select
                value={selectedOrder.status}
                onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-medium transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
