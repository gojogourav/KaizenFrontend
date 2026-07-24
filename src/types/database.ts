/**
 * Database TypeScript Interfaces matching Django REST Framework & PostgreSQL Schema
 */

export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  date_joined: string;
}

export type PropertyStatus = 'available' | 'locked' | 'sold';

export interface Property {
  id: string | number;
  title: string;
  description: string;
  price: number;
  property_type: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  status: PropertyStatus;
  images: string[]; // Array of image URLs
  created_date: string;
  is_favorited?: boolean; // Evaluated dynamically for authenticated user
}

export type BookingState = 'Locked' | 'Purchased' | 'Cancelled';

export interface Booking {
  id: string | number;
  user: User | number;
  property: Property;
  booking_state: BookingState;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string | number;
  user: number;
  property: Property;
  created_at: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone_number: string;
  message: string;
  property_reference?: string | number | null;
}
