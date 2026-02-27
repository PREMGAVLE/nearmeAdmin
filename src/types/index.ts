// ===== Roles =====
export type UserRole = 'super_admin' | 'admin' | 'salesman' | 'owner' | 'user';

// ===== Business Type =====
export type BusinessType = 'leads' | 'booking' | 'hybrid';

// ===== Subscription =====
export interface Subscription {
  status: 'active' | 'expired' | 'none';
  planType?: string;
  startDate?: string;
  expiryDate?: string;
}

// ===== User =====
export interface User {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  status: 'active' | 'blocked' | 'inactive';
  city?: string;
  categoryPreference?: string;
  subscription: Subscription;
  acceptTerms?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== Contact Numbers (nested in Business) =====
export interface ContactNumbers {
  primary: string;
  whatsapp?: string;
}

// ===== Address (nested in Business) =====
export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

// ===== Payment Details (nested in Business) =====
export interface PaymentDetails {
  amount: number;
  paymentMode: 'cash' | 'upi';
  paymentStatus: 'pending' | 'verified';
  paymentNote?: string;
  paymentDate?: string;
}

// ===== Verification (nested in Business) =====
export interface Verification {
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
}

// ===== Business =====
export interface Business {
  _id: string;
  businessName: string;
  categoryId: string;
  contactNumbers: ContactNumbers;
  address: BusinessAddress;
  listingType: 'normal' | 'premium';
  businessType: BusinessType;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isPremium: boolean;
  isActive: boolean;
  isVisible: boolean;
  premiumSource?: 'subscription' | 'manual' | 'none';
  premiumExpiry?: string;
  premiumRequestStatus?: 'none' | 'premium_requested' | 'premium_approved' | 'premium_rejected';
  paymentDetails: PaymentDetails;
  verification: Verification;
  rejectionReason?: string;
  serviceArea?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  logo?: string;
  avgRating?: number;
  ownerId?: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt?: string;
}

// ===== Category =====
export interface Category {
  _id: string;
  name: string;
  section?: string;
  isActive?: boolean;
  iconKey?: string;
  businessCount?: number;
  createdAt?: string;
}

// ===== Lead =====
export interface Lead {
  _id: string;
  customerName: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'converted';
  leadType?: 'lead' | 'booking' | 'hybrid';
  assignedTo: string | User;
  businessId?: string;
  assignedBusinessId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ===== Booking =====
export interface Booking {
  _id: string;
  businessId: string | Business;
  customerName?: string;
  phone?: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingDate: string;
  createdAt: string;
  updatedAt?: string;
}

// ===== Dashboard Stats =====
export interface DashboardStats {
  totalBusinesses: number;
  premiumListings: number;
  totalSalesmen: number;
  totalRevenue: number;
  pendingApprovals: number;
  approvedToday: number;
  newToday: number;
  premiumRequests: number;
  verifiedPayments: number;
  totalLeads?: number;
  totalBookings?: number;
  totalUsers?: number;
  activeSubscriptions?: number;
  conversionRate?: number;
  totalBusinessesTrend?: string;
  activeBusinessesTrend?: string;
  pendingApprovalsTrend?: string;
  totalRevenueTrend?: string;
  totalLeadsTrend?: string;
  totalBookingsTrend?: string;
  premiumBusinessesTrend?: string;
  premiumListingsTrend?: string;
  conversionRateTrend?: string;
  totalSalesmenTrend?: string;
  verifiedPaymentsTrend?: string;

}

// ===== API Response Wrappers =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: any;
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ===== Query Params =====
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BusinessFilters extends PaginationParams {
  approvalStatus?: string;
  listingType?: string;
  categoryId?: string;
  city?: string;
  isPremium?: boolean;
  createdBy?: string;
  businessType?: string;
  premiumRequestStatus?: string;
}

export interface UserFilters extends PaginationParams {
  role?: string;
  status?: string;
}

export interface LeadFilters extends PaginationParams {
  status?: string;
  assignedTo?: string;
  businessId?: string;
}

export interface BookingFilters extends PaginationParams {
  bookingStatus?: string;
  paymentStatus?: string;
}
