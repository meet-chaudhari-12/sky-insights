// Simple localStorage-backed persistence for favorites and recent searches

const FAVORITES_KEY = 'sky_favorites_v1';
const HISTORY_KEY = 'sky_history_v1';

export const getFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 50)));
  } catch (_) {}
};

export const toggleFavorite = (cityName) => {
  const list = getFavorites();
  const exists = list.includes(cityName);
  const next = exists ? list.filter((c) => c !== cityName) : [cityName, ...list];
  saveFavorites(next);
  return next;
};

export const getHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

export const pushHistory = (cityName) => {
  const list = getHistory();
  const withoutDup = list.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
  const next = [cityName, ...withoutDup].slice(0, 20);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (_) {}
};

export const removeHistoryItem = (cityName) => {
  const list = getHistory();
  const next = list.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
};
