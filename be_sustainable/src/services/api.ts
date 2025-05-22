import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Change this to your backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@BeSustainable:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/login', data),
  getProfile: (userId: number) =>
    api.get(`/profile/${userId}`),
};

// Tasks API
export const tasksAPI = {
  createTask: (data: { title: string; description: string; points: number; user_id: number }) =>
    api.post('/tasks', data),
  getUserTasks: (userId: number) =>
    api.get(`/tasks/user/${userId}`),
  completeTask: (taskId: number) =>
    api.put(`/tasks/${taskId}/complete`),
  deleteTask: (taskId: number) =>
    api.delete(`/tasks/${taskId}`),
};

// Levels API
export const levelsAPI = {
  getAllLevels: () =>
    api.get('/levels'),
  getLevelByPoints: (points: number) =>
    api.get(`/levels/by-points/${points}`),
};

export default api; 