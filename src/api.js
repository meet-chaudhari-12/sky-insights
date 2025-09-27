// src/api.js
const API_URL = "http://localhost:5000/api";

export const signup = async (data) => {
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Signup error:", err);
    return { error: "Signup failed" };
  }
};

export const login = async (data) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        return { error: errorData.msg || 'Login failed' };
    }
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Login failed" };
  }
};

// --- FAVORITES FUNCTIONS ---

export const getFavorites = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/favorites`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    console.error("Get favorites error:", err);
    return [];
  }
};

export const addFavorite = async (city) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ city }),
    });
    return await res.json();
  } catch (err) {
    console.error("Add favorite error:", err);
    return [];
  }
};

export const removeFavorite = async (city) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/favorites`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ city }),
    });
    return await res.json();
  } catch (err) {
    console.error("Remove favorite error:", err);
    return [];
  }
};

// --- NEW USER PREFERENCE FUNCTIONS ---

export const getUserDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/user`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    console.error("Get user details error:", err);
    return null;
  }
};

export const setHomeLocation = async (city) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/user/home`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ city }),
    });
    return await res.json();
  } catch (err) {
    console.error("Set home location error:", err);
    return null;
  }
};

// --- NEW: HISTORY FUNCTIONS ---

export const getHistory = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/history`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    console.error("Get history error:", err);
    return [];
  }
};

export const addHistory = async (city) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ city }),
    });
    return await res.json();
  } catch (err) {
    console.error("Add history error:", err);
    return [];
  }
};

export const removeHistory = async (city) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/history`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ city }),
    });
    return await res.json();
  } catch (err) {
    console.error("Remove history error:", err);
    return [];
  }
};