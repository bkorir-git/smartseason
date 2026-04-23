import axios from "axios";

const api = axios.create({
  baseURL: "https://smartseason-production-1749.up.railway.app/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartseason_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;