import axios from "axios";

const api = axios.create({
  baseURL: typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "/api"),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Don't redirect on auth endpoints (login/register) — those 401s are credential errors
      const url = error.config?.url || "";
      if (!url.includes("/auth/")) {
        localStorage.removeItem("token");
        // Redirect based on current path
        const path = window.location.pathname;
        if (path.startsWith("/seller")) {
          window.location.href = "/seller/login";
        } else if (path.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
