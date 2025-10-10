import axios from "axios";

const normalizedBaseUrl = (() => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000/api";
})();

const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
