import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.0.2.2:3000', // Android Emulator special IP for localhost
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
    api.post('/api/users/register', data),
  login: (data: { email: string; password: string }) => {
    // Log para debug (não incluir a senha real)
    console.log('Making login request with:', { 
      email: data.email,
      hasPassword: !!data.password,
      passwordLength: data.password?.length
    });

    // Garantir que estamos enviando os dados corretos
    const loginData = {
      email: data.email,
      password: data.password
    };

    console.log('Login data being sent:', loginData);
    return api.post('/api/users/login', loginData);
  },
  getProfile: (userId: number) =>
    api.get(`/api/users/profile/${userId}`),
};

// Tasks API
export const tasksAPI = {
  createTask: (data: { title: string; description: string; points: number; user_id: number }) =>
    api.post('/api/tasks', data),
  getUserTasks: (userId: number) =>
    api.get(`/api/tasks/user/${userId}`),
  completeTask: (taskId: number, userId: number) =>
    api.put(`/api/tasks/${taskId}/complete`, { user_id: userId }),
  deleteTask: (taskId: number) =>
    api.delete(`/api/tasks/${taskId}`),
};

// Levels API
export const levelsAPI = {
  getUserLevel: (userId: number) =>
    api.get(`/api/users/${userId}/level`),
};

export default api; 