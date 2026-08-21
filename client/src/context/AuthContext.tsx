import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, RegisterCredentials, UpdateProfileInput, UpdatePasswordInput } from "../types";
import { authService } from "../services/authService";
import { AUTH_TOKEN_KEY, toApiError } from "../services/api";
import { useToast } from "./ToastContext";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  updatePassword: (data: UpdatePasswordInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // Hydrate user profile on initial app load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch {
        // If token is invalid or expired, clear storage
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      const res = await authService.login(credentials);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, "success");
      return res.user;
    } catch (err) {
      const apiErr = toApiError(err);
      showToast(apiErr.message, "error");
      throw err;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    try {
      const res = await authService.register(credentials);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(`Account created! Welcome to Onyra, ${res.user.name}.`, "success");
      return res.user;
    } catch (err) {
      const apiErr = toApiError(err);
      showToast(apiErr.message, "error");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    showToast("You have been signed out.", "info");
  };

  const updateProfile = async (data: UpdateProfileInput): Promise<void> => {
    try {
      const updated = await authService.updateProfile(data);
      setUser(updated);
      showToast("Profile updated successfully", "success");
    } catch (err) {
      const apiErr = toApiError(err);
      showToast(apiErr.message, "error");
      throw err;
    }
  };

  const updatePassword = async (data: UpdatePasswordInput): Promise<void> => {
    try {
      await authService.updatePassword(data);
      showToast("Password updated successfully", "success");
    } catch (err) {
      const apiErr = toApiError(err);
      showToast(apiErr.message, "error");
      throw err;
    }
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
