import { api } from "./api";
import { ApiResponse, Category, PaginatedProducts, Product, Review } from "@/types";

export interface ProductQuery {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  async list(query: ProductQuery = {}) {
    const { data } = await api.get<ApiResponse<PaginatedProducts>>("/products", { params: query });
    return data.data;
  },
  async featured() {
    const { data } = await api.get<ApiResponse<Product[]>>("/products/featured");
    return data.data;
  },
  async getBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<{ product: Product; reviews: Review[]; related: Product[] }>>(
      `/products/${slug}`
    );
    return data.data;
  },
  async create(payload: Partial<Product>) {
    const { data } = await api.post<ApiResponse<Product>>("/products", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Product>) {
    const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await api.delete(`/products/${id}`);
  },
  async submitReview(slug: string, payload: { rating: number; text: string }) {
    const { data } = await api.post<ApiResponse<Review>>(`/products/${slug}/reviews`, payload);
    return data.data;
  },
};

export const categoryService = {
  async list() {
    const { data } = await api.get<ApiResponse<Category[]>>("/categories");
    return data.data;
  },
};
