import { menuItems as seededMenuItems, pickupSlots } from '../data/mockData';
import { readJSON, writeJSON } from './storage';

const SC_MENU = 'sc_menu';
const SC_ORDERS = 'sc_orders';
const SC_SETTINGS = 'sc_settings';
const SC_POINTS = 'sc_points';

export const defaultSettings = {
  canteenName: 'SmartCanteen',
  lunchBreakStart: '13:30',
  lunchBreakEnd: '14:00',
  maxOrdersPerSlot: 50,
  messPointsEnabled: true,
  pointsRate20To49: 5,
  pointsRate50To99: 8,
  pointsRate100Plus: 12,
  noticeBoard: 'Welcome to SmartCanteen. Pick up your order on time.'
};

export const ensureMenuInStorage = () => {
  const currentMenu = readJSON(SC_MENU, null);
  if (!currentMenu || !Array.isArray(currentMenu) || currentMenu.length === 0) {
    writeJSON(SC_MENU, seededMenuItems);
    return seededMenuItems;
  }
  return currentMenu;
};

export const getMenuFromStorage = () => ensureMenuInStorage();

export const saveMenuToStorage = (menu) => writeJSON(SC_MENU, menu);

export const getOrdersFromStorage = () => readJSON(SC_ORDERS, []);

export const saveOrdersToStorage = (orders) => writeJSON(SC_ORDERS, orders);

export const getSettingsFromStorage = () => {
  const settings = readJSON(SC_SETTINGS, null);
  if (!settings) {
    writeJSON(SC_SETTINGS, defaultSettings);
    return defaultSettings;
  }
  return { ...defaultSettings, ...settings };
};

export const saveSettingsToStorage = (settings) => writeJSON(SC_SETTINGS, settings);

export const getPointsDataFromStorage = () => readJSON(SC_POINTS, { total: 0, history: [] });

export const isToday = (dateValue) => {
  if (!dateValue) {
    return false;
  }
  const date = new Date(dateValue);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

export const parseSlotRangeToMinutes = (slotLabel) => {
  const [startLabel, endLabel] = slotLabel.split('–').map((value) => value.trim());

  const toMinutes = (label) => {
    const [time, meridian] = label.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  return { start: toMinutes(startLabel), end: toMinutes(endLabel) };
};

export const getSlotCounts = (orders) => {
  const initialCounts = Object.fromEntries(pickupSlots.map((slot) => [slot.label, 0]));

  orders.forEach((order) => {
    if (initialCounts[order.pickupSlot] !== undefined) {
      initialCounts[order.pickupSlot] += 1;
    }
  });

  return pickupSlots.map((slot) => ({
    ...slot,
    count: initialCounts[slot.label] || 0
  }));
};

export const crowdLevelFromCount = (count) => {
  if (count <= 10) return 'low';
  if (count <= 25) return 'medium';
  return 'high';
};

export const crowdColorClass = (level) => {
  if (level === 'low') return 'bg-emerald-500';
  if (level === 'medium') return 'bg-amber-400';
  return 'bg-red-500';
};

const formatToTimeRange24h = (slotLabel) => {
  const [startLabel, endLabel] = slotLabel.split('–').map((value) => value.trim());

  const to24h = (label) => {
    const [time, meridian] = label.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return `${to24h(startLabel)}-${to24h(endLabel)}`;
};

// Backward-compatible export used by legacy admin pages.
export const getTodaySlots = () => {
  const orders = getOrdersFromStorage();
  const todayOrders = orders.filter((order) => isToday(order.timestamp || order.date));

  return pickupSlots.map((slot) => {
    const orderCount = todayOrders.filter((order) => {
      const orderSlot = order.pickupSlot || order.slot;
      return orderSlot === slot.label;
    }).length;

    return {
      id: slot.id,
      time: slot.label,
      timeRange: formatToTimeRange24h(slot.label),
      capacity: defaultSettings.maxOrdersPerSlot,
      orderCount,
      crowdLevel: crowdLevelFromCount(orderCount)
    };
  });
};

// Backward-compatible export used by legacy admin pages.
export const getRevenueStats = () => {
  const orders = getOrdersFromStorage();
  const todayOrders = orders.filter((order) => isToday(order.timestamp || order.date));

  const totalRevenue = todayOrders.reduce((sum, order) => {
    const amount = Number(order.totalAmount ?? order.totalPrice ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const orderCount = todayOrders.length;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return {
    totalRevenue,
    orderCount,
    averageOrderValue
  };
};

// Backward-compatible export used by legacy admin pages.
export const getMenuFromMockData = () => seededMenuItems;
