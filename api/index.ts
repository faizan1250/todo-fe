// api/index.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://todo-backend-kfpi.onrender.com/api', // Change to your backend IP when testing on device
  timeout: 5000,
});

export default api;
