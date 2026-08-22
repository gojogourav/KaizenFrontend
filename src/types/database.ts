export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;        // ← add
  avatarUrl?: string;   // ← add
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface PlatformListing {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface PropertyListing {
  platform: string;
  isActive: boolean;
  url: string;
}

export interface Property {
  id: string | number;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  adr?: number;
  images?: string[];
  bedsBaths?: string;
  squareFeet?: string | number;
  furnished?: 'Yes' | 'No' | string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'UNDER CONTRACT' | 'UNDER REVIEW' | 'MAINTENANCE' | string;
  listings?: PlatformListing[];
  owner?: string | number;
  created_at?: string;
  updated_at?: string;
}

export type BookingState = 'LOCKED' | 'PURCHASED' | 'CANCELLED';

export interface Booking {
  id: string | number;
  property: Property | null;
  state: BookingState;
  created_at: string;
  lock_expires_at?: string;
}

export interface Favorite {
  id: string | number;
  property: Property;
  created_at: string;
  toggleFavorite: (propertyId: string | number, propertySnapshot?: Partial<Property>) => Promise<void>;
  media: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone_number: string;
  message: string;
  property_reference: string | number | null;
}

export interface DashboardStatistics {
  favorites: number;
  locked: number;
  purchased: number;
  cancelled: number;
}

export interface DashboardResponse {
  user: User;
  statistics: DashboardStatistics;
  recent_bookings: Booking[];
  recent_favorites: Favorite[];
}
