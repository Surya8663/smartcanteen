/**
 * Safe localStorage wrapper with error handling
 * Prevents crashes due to storage quota or corruption
 */

export const storage = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (error) {
      console.error(`Error reading '${key}' from storage:`, error);
      return fallback;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Storage full or unavailable. Could not set '${key}':`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing '${key}' from storage:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  keys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }
};

// Legacy exports for backward compatibility
export const readJSON = (key, fallback) => storage.get(key, fallback);
export const writeJSON = (key, value) => storage.set(key, value);
