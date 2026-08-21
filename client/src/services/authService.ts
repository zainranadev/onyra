import { api } from "./api";
import {
  ApiResponse,
  AuthResponse,
  User,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileInput,
  UpdatePasswordInput,
} from "../types";

export const authService = {
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data.data;
  },

  async login(data: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    const res = await api.put<ApiResponse<User>>("/auth/profile", data);
    return res.data.data;
  },

  async updatePassword(data: UpdatePasswordInput): Promise<void> {
    await api.put<ApiResponse<null>>("/auth/password", data);
  },
};
