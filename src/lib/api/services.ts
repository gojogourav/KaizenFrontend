/**
 * Django REST Framework Service Integration Layer
 * Maps directly to PostgreSQL / Django backend CRUD workflows
 */

import { apiClient, setStoredToken, removeStoredToken } from './client';
import {
  User,
  Property,
  Booking,
  Favorite,
  LeadPayload
} from '../../types/database';

// Authentication & Profile Services
export const authService = {
  /**
   * Submit credentials to obtain JWT token + User profile
   */
  async login(credentials: { email?: string; username?: string; password?: string }): Promise<{ token: string; user: User }> {
    const response = await apiClient<{ token?: string; access?: string; user: User }>('/api/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const token = response.token || response.access || 'mock_jwt_token';
    setStoredToken(token);
    return {
      token,
      user: response.user,
    };
  },

  /**
   * Log out active user and clear session token
   */
  async logout(): Promise<void> {
    try {
      await apiClient('/api/logout/', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      removeStoredToken();
    }
  },

  /**
   * Fetch current authenticated User record
   */
  async getProfile(): Promise<User> {
    return apiClient<User>('/api/me/', { method: 'GET' });
  },
};

// Properties Services (Property Table)
export const propertyService = {
  /**
   * Get filtered list of property records
   */
  async getProperties(filters?: {
    city?: string;
    status?: string;
    property_type?: string;
    search?: string;
  }): Promise<Property[]> {
    return apiClient<Property[]>('/api/properties/', {
      method: 'GET',
      params: filters,
    });
  },

  /**
   * Retrieve single Property detail record by ID
   */
  async getPropertyById(id: string | number): Promise<Property> {
    return apiClient<Property>(`/api/properties/${id}/`, { method: 'GET' });
  },
};

// Bookings Services (Booking Table)
export const bookingService = {
  /**
   * Initiate a Locked booking record for a property
   */
  async lockProperty(propertyId: string | number): Promise<Booking> {
    return apiClient<Booking>(`/api/properties/${propertyId}/lock/`, {
      method: 'POST',
    });
  },

  /**
   * Update booking state from Locked to Purchased
   */
  async purchaseBooking(bookingId: string | number): Promise<Booking> {
    return apiClient<Booking>(`/api/bookings/${bookingId}/purchase/`, {
      method: 'POST',
    });
  },

  /**
   * Update booking state to Cancelled
   */
  async cancelBooking(bookingId: string | number): Promise<Booking> {
    return apiClient<Booking>(`/api/bookings/${bookingId}/cancel/`, {
      method: 'POST',
    });
  },

  /**
   * Fetch all bookings belonging to the active user
   */
  async getUserBookings(): Promise<Booking[]> {
    return apiClient<Booking[]>('/api/me/bookings/', { method: 'GET' });
  },
};

// Favorites Services (Favorite Table)
export const favoriteService = {
  /**
   * Toggle favorite record on Favorites table
   */
  async toggleFavorite(propertyId: string | number): Promise<{ is_favorited: boolean }> {
    return apiClient<{ is_favorited: boolean }>(`/api/properties/${propertyId}/favorite/`, {
      method: 'POST',
    });
  },

  /**
   * Fetch all saved properties for logged-in user
   */
  async getFavorites(): Promise<Favorite[]> {
    return apiClient<Favorite[]>('/api/me/favorites/', { method: 'GET' });
  },
};

// Leads Services (Lead Table)
export const leadService = {
  /**
   * Submit public contact inquiries tied to a property_reference
   */
  async submitLead(data: LeadPayload): Promise<{ success: boolean; id: string | number; message?: string }> {
    return apiClient<{ success: boolean; id: string | number; message?: string }>('/api/leads/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
