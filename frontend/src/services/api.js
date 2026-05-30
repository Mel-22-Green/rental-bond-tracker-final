// frontend/src/services/api.js
import axios from 'axios';

// In development:  uses http://localhost:5000/api
// In production:   uses REACT_APP_API_URL from .env (your Railway backend URL)
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      req.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  return req;
});

export default API;