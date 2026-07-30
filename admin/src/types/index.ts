export type Role = "customer" | "provider" | "admin";

export type PriceType = "one_time" | "monthly" | "negotiable";

export interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  icon: string;
  sortOrder: number;
  priceType: PriceType;
  price?: number;
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: Role;
  city: string;
  subCity?: string;
  language: string;
  avatarUrl?: string;

  categoryIds?: string[];
  workAreas?: string[];
  bio?: string;
  yearsExperience?: number;
  isVerified?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  isAvailable?: boolean;
  isSuspended?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Provider extends User {
  categories: Category[];
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface PartySummary {
  id: string;
  fullName: string;
  phone: string;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  categoryId: string;
  description?: string;
  address?: string;
  status: BookingStatus;
  priceQuote?: number;
  createdAt: string;
  updatedAt: string;
  provider?: PartySummary;
  customer?: PartySummary;
  category?: Category;
}

export interface Paginated<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

export interface DailyPoint {
  date: string;
  bookings: number;
  newUsers: number;
}

export interface CategoryBookingCount {
  categoryId: string;
  nameEn: string;
  nameAm: string;
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  availableProviders: number;
  verifiedProviders: number;
  totalBookings: number;
  statusCounts: Record<BookingStatus, number>;
  totalRevenue: number;
  trend: DailyPoint[];
  categoryBookings: CategoryBookingCount[];
}
