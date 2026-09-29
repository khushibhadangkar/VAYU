const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const api = {
  async getEnvironment(city: string = 'Mumbai') {
    const res = await fetch(`${API_BASE_URL}/environment/current?city=${city}`);
    if (!res.ok) throw new Error('Failed to fetch environment');
    return res.json();
  },

  async getTimeline(city: string = 'Mumbai') {
    const res = await fetch(`${API_BASE_URL}/environment/timeline?city=${city}`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  }
};
