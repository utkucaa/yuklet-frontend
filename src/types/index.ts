export type Role = 'GUEST' | 'SHIPPER' | 'CARRIER' | 'ADMIN';
export type UserType = 'ADMIN' | 'CARRIER' | 'SHIPPER';

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  city?: string;
  address?: string;
  about?: string;
  phoneNumber?: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
}

export type ListingType = 'LOAD' | 'CAPACITY';

export type VehicleType = 'TIR' | 'Kamyon' | 'Kamyonet' | 'Panelvan';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Listing {
  id: number;
  type: ListingType;
  title: string;
  fromCity: string;
  toCity?: string;
  pickupDate?: string;
  deliveryDate?: string;
  capacityTons?: number;
  vehicleType?: VehicleType;
  price?: number;
  currency?: Currency;
  companyName?: string;
  images?: string[];
  notes?: string;
  createdAt: string;
  createdBy: number;
  isVerified?: boolean;
  isActive: boolean;
  contactPhone?: string;
  createdByProfile?: UserProfile;
}

export interface SearchParams {
  // Basic filters
  q?: string;
  type?: ListingType;
  fromCity?: string;
  toCity?: string;
  dateFrom?: string;
  dateTo?: string;
  minCap?: number;
  maxCap?: number;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  company?: string;
  verifiedOnly?: boolean;
  
  // Advanced filters (cURL examples)
  cargoType?: 'GENERAL' | 'FRAGILE' | 'FROZEN';
  minWeight?: number;
  maxWeight?: number;
  startDate?: string;
  endDate?: string;
  
  // Sorting
  sortBy?: 'createdDate' | 'price' | 'weight';
  sortDirection?: 'ASC' | 'DESC';
  sort?: 'new' | 'priceAsc' | 'priceDesc' | 'capDesc';
  
  // Pagination
  page?: number;
  size?: number;
}

export interface ListingResponse {
  content: Listing[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile?: UserProfile;
}

export interface City {
  id: number;
  name: string;
  region: string;
  coordinates: [number, number];
}

// Messaging
export interface Conversation {
  id: number;
  otherUserId?: number;
  otherUserName?: string;
  otherUserCompany?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  updatedAt?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead?: boolean;
  // Optional metadata provided by backend for display
  senderFirstName?: string;
  senderLastName?: string;
  senderEmail?: string;
}

export interface ChatMessagePayload {
  sender: string;
  content: string;
  timestamp?: string; // ISO-8601
}

// Favorites
export type EntityType = 'CARGO_REQUEST' | 'TRANSPORT_OFFER';

export interface Favorite {
  id: number;
  entityId: number;
  entityType: EntityType;
  createdAt: string;
}

// Ratings
export interface Rating {
  id: number;
  ratedUserId: number;
  cargoRequestId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RatingStats {
  average: number;
  count: number;
}

// Notifications
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// Vehicles
export interface Vehicle {
  id: number;
  carrierId: number;
  vehicleType: VehicleType;
  plateNumber: string;
  maxWeightKg: number;
  hasCrane: boolean;
  hasTemperatureControl: boolean;
  createdAt: string;
  updatedAt: string;
}

// Files
export type FileType = 'PROFILE_IMAGE' | 'IDENTITY_DOCUMENT' | 'VEHICLE_IMAGE' | 'CARGO_IMAGE';

export interface FileInfo {
  id: number;
  fileName: string;
  originalFileName: string;
  fileType: FileType;
  entityId: number;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

// Verification
export type VerificationType = 'IDENTITY_DOCUMENT' | 'BUSINESS_LICENSE' | 'VEHICLE_REGISTRATION';

export interface Verification {
  id: number;
  userId: number;
  verificationType: VerificationType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentUrl?: string;
}