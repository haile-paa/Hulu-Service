import axios from "axios";

// Same backend the mobile app talks to. Set VITE_API_URL in a .env file to
// point somewhere other than local dev, e.g. VITE_API_URL=https://api.example.com/api
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hulu_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("hulu_admin_token");
      localStorage.removeItem("hulu_admin_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
