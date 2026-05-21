import { Product, User, Order, OrderStatus, AuthState } from "./types";

const API_BASE = "/api";

// Helper for standard HTTP request headers including Auth Bearer Token
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("ecostore_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Custom error handling helper
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP request failed: status ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    localStorage.setItem("ecostore_token", data.token);
    localStorage.setItem("ecostore_user", JSON.stringify(data.user));
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res);
    localStorage.setItem("ecostore_token", data.token);
    localStorage.setItem("ecostore_user", JSON.stringify(data.user));
    return data;
  },

  logout(): void {
    localStorage.removeItem("ecostore_token");
    localStorage.removeItem("ecostore_user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("ecostore_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Products
  async getProducts(filters?: { search?: string; category?: string; sortBy?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (filters?.search) query.append("search", filters.search);
    if (filters?.category) query.append("category", filters.category);
    if (filters?.sortBy) query.append("sortBy", filters.sortBy);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async deleteProduct(id: string): Promise<{ message: string; product: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createOrder(orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Order["shippingAddress"];
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Business Analytics / Dashboard Stats
  async getStats(): Promise<{
    totals: {
      totalSales: number;
      ordersCount: number;
      productsCount: number;
      lowStockItemsCount: number;
    };
    categoryChartData: { name: string; value: number }[];
    recentOrders: Order[];
  }> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Developer Server Diagnostics
  async getDiagnostics(): Promise<any> {
    const res = await fetch(`${API_BASE}/info`);
    return handleResponse(res);
  }
};
