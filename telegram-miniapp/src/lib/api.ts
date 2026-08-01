const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

export class ApiError extends Error {}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

// ---- Types mirroring the Go backend's JSON shapes ----

export interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  icon: string;
  sortOrder: number;
  priceType: "one_time" | "monthly" | "negotiable";
  price?: number;
}

export interface UserSummary {
  id: string;
  fullName: string;
  phone: string;
}

export interface Provider {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  workAreas?: string[];
  bio?: string;
  yearsExperience?: number;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  isAvailable: boolean;
  categories: Category[];
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  categoryId: string;
  description: string;
  address: string;
  status: BookingStatus;
  priceQuote?: number;
  createdAt: string;
  updatedAt: string;
  provider?: UserSummary;
  customer?: UserSummary;
  category?: Category;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  role: "customer" | "provider" | "admin";
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

// ---- Public ----

export const listCategories = () => request<{ categories: Category[] }>("/categories");

export const listAreas = () => request<{ areas: string[] }>("/areas");

export const listProviders = (params: {
  categoryId?: string;
  area?: string;
  availableOnly?: boolean;
  q?: string;
}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]
  ).toString();
  return request<{ providers: Provider[] }>(`/providers${qs ? `?${qs}` : ""}`);
};

export const register = (input: {
  fullName: string;
  phone: string;
  password: string;
  role: "customer" | "provider";
  city: string;
  language?: string;
  categoryIds?: string[];
  workAreas?: string[];
  yearsExperience?: number;
}) => request<AuthResult>("/auth/register", { method: "POST", body: input });

export const login = (input: { phone: string; password: string }) =>
  request<AuthResult>("/auth/login", { method: "POST", body: input });

// ---- Customer (authenticated) ----

export const createBooking = (
  token: string,
  input: { providerId: string; categoryId?: string; description?: string; address?: string }
) => request<{ booking: Booking }>("/customer/bookings", { method: "POST", body: input, token });

export const listCustomerBookings = (token: string) =>
  request<{ bookings: Booking[] }>("/customer/bookings", { token });

export const cancelBooking = (token: string, bookingId: string) =>
  request<{ status: string }>(`/customer/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    token,
  });

// ---- Provider (authenticated) ----

export const setAvailability = (token: string, isAvailable: boolean) =>
  request<{ isAvailable: boolean }>("/provider/availability", {
    method: "PATCH",
    body: { isAvailable },
    token,
  });

export const listProviderBookings = (token: string) =>
  request<{ bookings: Booking[] }>("/provider/bookings", { token });

export const respondToBooking = (token: string, bookingId: string, action: "accept" | "decline") =>
  request<{ status: string }>(`/provider/bookings/${bookingId}/respond`, {
    method: "PATCH",
    body: { action },
    token,
  });

export const completeBooking = (token: string, bookingId: string) =>
  request<{ status: string }>(`/provider/bookings/${bookingId}/complete`, {
    method: "PATCH",
    token,
  });

// ---- Chat (authenticated, either role) ----

export const listMessages = (token: string, bookingId: string) =>
  request<{ messages: Message[] }>(`/bookings/${bookingId}/messages`, { token });

export const sendMessage = (token: string, bookingId: string, text: string) =>
  request<{ message: Message }>(`/bookings/${bookingId}/messages`, {
    method: "POST",
    body: { text },
    token,
  });
