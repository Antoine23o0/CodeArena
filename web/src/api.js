import axios from "axios";

const sanitizePort = (rawPort) => {
  if (!rawPort) return null;
  const trimmed = `${rawPort}`.trim();
  if (!trimmed) return null;
  return trimmed;
};

const deriveBrowserBaseUrl = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const { protocol, hostname } = window.location;
  const fallbackPort = sanitizePort(import.meta.env.VITE_API_FALLBACK_PORT) || "3000";

  if ((protocol === "http:" && fallbackPort === "80") || (protocol === "https:" && fallbackPort === "443")) {
    return `${protocol}//${hostname}/api`;
  }

  return `${protocol}//${hostname}:${fallbackPort}/api`;
};

const normalizedBaseUrl = (() => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const browserDerived = deriveBrowserBaseUrl();
  if (browserDerived) {
    return browserDerived;
  }

  return "http://localhost:3000/api";
})();

const resolveApiOrigin = () => {
  try {
    return new URL(normalizedBaseUrl).origin;
  } catch {
    if (typeof window !== "undefined") {
      const { protocol, hostname } = window.location;
      return `${protocol}//${hostname}`;
    }
    return "http://localhost:3000";
  }
};

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
export const apiBaseUrl = normalizedBaseUrl;
export const apiOrigin = resolveApiOrigin();
