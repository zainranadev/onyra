import { api } from "./api";
import { ApiResponse, Order } from "@/types";

export interface CheckoutPayload {
  customer: { fullName: string; email: string; phone: string };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: "standard" | "express";
  items: { productId: string; quantity: number }[];
  couponCode?: string;
}

export const orderService = {
  async create(payload: CheckoutPayload) {
    const { data } = await api.post<ApiResponse<Order>>("/orders", payload);
    return data.data;
  },
  async list(params: { status?: string; search?: string } = {}) {
    const { data } = await api.get<ApiResponse<Order[]>>("/orders", { params });
    return data.data;
  },
  async myOrders() {
    const { data } = await api.get<ApiResponse<Order[]>>("/orders/my-orders");
    return data.data;
  },
  async get(id: string) {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },
  async updateStatus(id: string, status: Order["status"]) {
    const { data } = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return data.data;
  },
};

export const adminService = {
  async stats() {
    const { data } = await api.get("/admin/stats");
    return data.data;
  },
  async dashboard() {
    const { data } = await api.get("/admin/dashboard");
    return data.data;
  },
};
