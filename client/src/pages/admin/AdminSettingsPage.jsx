import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';

export default function AdminSettingsPage() {
  const { notify } = usePortal();
  const [settings, setSettings] = useState({
    canteenName: 'SmartCanteen',
    orderTimeout: 30,
    slotNoticeTime: 60,
    pointsPerRupee: 1,
    minOrderValue: 50,
    maxOrdersPerSlot: 100,
    enableNotifications: true,
    maintenanceMode: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('sc_settings') || '{}');
    if (Object.keys(stored).length > 0) {
      setSettings(stored);
    }
  }, []);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('sc_settings', JSON.stringify(settings));
      setIsSaving(false);
      notify('Settings saved successfully', 'success');
    }, 500);
  };

  const handleReset = () => {
    setSettings({
      canteenName: 'SmartCanteen',
      orderTimeout: 30,
      slotNoticeTime: 60,
      pointsPerRupee: 1,
      minOrderValue: 50,
      maxOrdersPerSlot: 100,
      enableNotifications: true,
      maintenanceMode: false
    });
    notify('Settings reset to defaults', 'info');
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Canteen Settings</h1>

        {/* Canteen Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Canteen Name</label>
          <input
            type="text"
            value={settings.canteenName}
            onChange={e => handleChange('canteenName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter canteen name"
          />
          <p className="text-xs text-gray-500 mt-1">This name will be displayed on the student portal</p>
        </div>

        {/* Order Timeout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Timeout (minutes)</label>
          <input
            type="number"
            value={settings.orderTimeout}
            onChange={e => handleChange('orderTimeout', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="30"
            min="5"
            max="180"
          />
          <p className="text-xs text-gray-500 mt-1">Auto-cancel orders if not confirmed within this time</p>
        </div>

        {/* Slot Notice Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slot Notice Time (minutes before)</label>
          <input
            type="number"
            value={settings.slotNoticeTime}
            onChange={e => handleChange('slotNoticeTime', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="60"
            min="10"
            max="300"
          />
          <p className="text-xs text-gray-500 mt-1">Send reminder notifications this many minutes before slot start</p>
        </div>

        {/* Points Per Rupee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Points Per Rupee</label>
          <input
            type="number"
            value={settings.pointsPerRupee}
            onChange={e => handleChange('pointsPerRupee', parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="1"
            min="0.1"
            step="0.1"
          />
          <p className="text-xs text-gray-500 mt-1">Loyalty points earned per rupee spent</p>
        </div>

        {/* Minimum Order Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (₹)</label>
          <input
            type="number"
            value={settings.minOrderValue}
            onChange={e => handleChange('minOrderValue', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="50"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum total amount required to place an order</p>
        </div>

        {/* Max Orders Per Slot */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Orders Per Slot</label>
          <input
            type="number"
            value={settings.maxOrdersPerSlot}
            onChange={e => handleChange('maxOrdersPerSlot', parseInt(e.target.value) || 100)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="100"
            min="10"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum orders allowed per time slot</p>
        </div>

        {/* Enable Notifications Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={e => handleChange('enableNotifications', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Enable email/SMS notifications</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">Send notifications to students for order updates</p>
        </div>

        {/* Maintenance Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Mode</label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={e => handleChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4 text-red-500 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Enable maintenance mode</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">Prevent students from placing new orders during maintenance</p>
        </div>

        {/* Warning if Maintenance Mode is On */}
        {settings.maintenanceMode && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">⚠️ Maintenance mode is active. Students cannot place orders.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
          >
            {isSaving ? '💾 Saving...' : '💾 Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition"
          >
            ↺ Reset to Default
          </button>
        </div>

        {/* System Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-6">
          <p className="text-sm font-semibold text-gray-900 mb-2">System Information</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>SmartCanteen Admin Portal v1.0</p>
            <p>Last Updated: {new Date().toLocaleString()}</p>
            <p>Storage: Using browser localStorage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
