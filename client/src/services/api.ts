import axios from "axios";

export const AUTH_TOKEN_KEY = "onyra_auth_token";

// Centralized API client.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization header if JWT token is stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorShape {
  message: string;
  error?: string;
}

// Normalizes axios/network failures into the { message } shape the UI expects
export function toApiError(err: unknown): ApiErrorShape {
  if (axios.isAxiosError(err)) {
    if (err.response?.data?.message) {
      return { message: err.response.data.message, error: err.response.data.error };
    }
    if (err.request) {
      return { message: "Can't reach the server right now. Check your connection and try again." };
    }
  }
  return { message: "Something unexpected happened. Please try again." };
}
