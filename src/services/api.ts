import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api'; // backend 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  signUp: async (data: {
    username: string;
    email: string;
    password: string;
    roles: string;
  }) => {
    const response = await api.post('/auth/signup', {
      username: data.username,
      email: data.email,
      password: data.password,
      roles: [data.roles],
    });
    return response.data;
  },

  signIn: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },
};

export const userService = {
  getUserInfo: async () => {
    const response = await api.get('/user/info');
    return response.data;
  },
};

export default api;