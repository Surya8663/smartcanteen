import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getMenuFromStorage, saveMenuToStorage, getMenuFromMockData } from '../../utils/adminData';

export default function AdminMenuPage() {
  const { showToast } = usePortal();
  const [menu, setMenu] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'breakfast', price: 0, qty: 10 });

  useEffect(() => {
    const stored = getMenuFromStorage();
    setMenu(stored || getMenuFromMockData());
  }, []);

  const handleSave = () => {
    if (!formData.name || formData.price < 0) {
      notify('Fill all fields correctly', 'error');
      return;
    }

    if (editingId) {
      const updated = menu.map(item => item.id === editingId ? { ...item, ...formData } : item);
      setMenu(updated);
      saveMenuToStorage(updated);
      notify('Menu item updated', 'success');
      setEditingId(null);
    } else {
      const newItem = { id: Date.now().toString(), ...formData, available: true };
      const updated = [...menu, newItem];
      setMenu(updated);
      saveMenuToStorage(updated);
      notify('Menu item added', 'success');
    }
    setFormData({ name: '', category: 'breakfast', price: 0, qty: 10 });
    setShowAddModal(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, category: item.category, price: item.price, qty: item.qty });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    const updated = menu.filter(item => item.id !== id);
    setMenu(updated);
    saveMenuToStorage(updated);
    notify('Menu item deleted', 'success');
    setConfirmDelete(null);
  };

  const toggleAvailability = (id) => {
    const updated = menu.map(item => item.id === id ? { ...item, available: !item.available } : item);
    setMenu(updated);
    saveMenuToStorage(updated);
    notify('Availability updated', 'success');
  };

  const lowStockItems = menu.filter(item => item.qty < 5);

  const filteredMenu = filter === 'all' ? menu : menu.filter(item => item.category === filter);

  const categories = ['breakfast', 'lunch', 'snacks', 'beverages', 'desserts'];

  return (
    <div className="p-6 space-y-6">
      {/* Low Stock Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">⚠️ {lowStockItems.length} items running low on stock</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              filter === cat ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingId(null);
          setFormData({ name: '', category: 'breakfast', price: 0, qty: 10 });
          setShowAddModal(true);
        }}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition"
      >
        + Add Item
      </button>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.category}</p>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">Price</p>
                <p className="font-semibold">₹{item.price}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">Stock</p>
                <p className="font-semibold">{item.qty}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailability(item.id)}
                className="flex-1 bg-blue-100 text-blue-700 py-1 rounded text-sm font-medium hover:bg-blue-200 transition"
              >
                {item.available ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 bg-yellow-100 text-yellow-700 py-1 rounded text-sm font-medium hover:bg-yellow-200 transition"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(item.id)}
                className="flex-1 bg-red-100 text-red-700 py-1 rounded text-sm font-medium hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={editingId ? 'Edit Item' : 'Add Item'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., Samosa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={formData.qty}
              onChange={e => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={handleSave} className="flex-1 bg-orange-500 text-white py-2 rounded font-medium hover:bg-orange-600">
              Save
            </button>
            <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Item?"
          message="This action cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
