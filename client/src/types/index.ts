export type UserRole = "customer" | "admin";

export interface UserAddress {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: UserAddress;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: UserAddress;
}

export interface UpdatePasswordInput {
  currentPassword?: string;
  newPassword?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  category: string;
  description: string;
  shortDescription: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

export interface Review {
  _id: string;
  product: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string;
  customer: { fullName: string; email: string; phone: string };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: "standard" | "express";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedProducts {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  totalCustomers: number;
}
