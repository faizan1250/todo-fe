// api/index.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.136.156:5000/api', // Change to your backend IP when testing on device
  timeout: 5000,
});

export default api;
