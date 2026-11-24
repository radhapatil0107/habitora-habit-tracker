import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHabits = () => api.get('/habits');
export const getHabitById = (id) => api.get(`/habits/${id}`);
export const createHabit = (data) => api.post('/habits', data);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
export const checkInHabit = (id, note = '') => api.post(`/habits/${id}/checkin`, { note });
export const undoCheckIn = (id) => api.delete(`/habits/${id}/checkin`);
export const getStats = () => api.get('/habits/stats');

export default api;
