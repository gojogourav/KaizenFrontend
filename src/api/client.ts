/**
 * Centralized API Client compatibility wrapper for Kaizen Real Estate Platform
 * Exports methods from /src/lib/api/client and /src/lib/api/services
 */

import {
  apiClient as requestApi,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from '../lib/api/client';
import {
  authService,
  propertyService,
  bookingService,
  favoriteService,
  leadService,
} from '../lib/api/services';

export { getStoredToken, setStoredToken, removeStoredToken };

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return requestApi<T>(endpoint, options);
}

// Unified API Service Object for backwards compatibility & clean modular imports
export const api = {
  // Auth & Profile
  login: (credentials: { email?: string; username?: string; password?: string }) =>
    authService.login(credentials),

  logout: () =>
    authService.logout(),

  getUserProfile: () =>
    authService.getProfile(),

  updateUserProfile: (data: any) =>
    requestApi('/api/me/', { method: 'PATCH', body: JSON.stringify(data) }),

  // Properties & Discovery
  getProperties: (params?: Record<string, string>) =>
    propertyService.getProperties(params),

  getPropertyDetails: (id: string | number) =>
    propertyService.getPropertyById(id),

  createProperty: (data: any) =>
    requestApi('/api/properties/', { method: 'POST', body: JSON.stringify(data) }),

  // Favorites
  getFavorites: () =>
    favoriteService.getFavorites(),

  addFavorite: (propertyId: string | number) =>
    favoriteService.toggleFavorite(propertyId),

  removeFavorite: (propertyId: string | number) =>
    favoriteService.toggleFavorite(propertyId),

  toggleFavorite: (propertyId: string | number) =>
    favoriteService.toggleFavorite(propertyId),

  // Lock & Purchase
  lockProperty: (propertyId: string | number) =>
    bookingService.lockProperty(propertyId),

  purchaseProperty: (bookingId: string | number) =>
    bookingService.purchaseBooking(bookingId),

  cancelBooking: (bookingId: string | number) =>
    bookingService.cancelBooking(bookingId),

  getMyBookings: () =>
    bookingService.getUserBookings(),

  // Dashboard & Leads
  getDashboard: () =>
    requestApi('/api/me/dashboard/', { method: 'GET' }),

  getDashboardSummary: () =>
    requestApi('/api/me/summary/', { method: 'GET' }),

  submitLead: (data: any) =>
    leadService.submitLead({
      name: data.name || '',
      email: data.email || '',
      phone_number: data.phone || data.phone_number || '',
      message: data.message || '',
      property_reference: data.propertyId || data.property_reference || null,
    }),

  getLeads: () =>
    requestApi('/api/leads/', { method: 'GET' }),

  deleteLead: (id: string | number) =>
    requestApi(`/api/leads/${id}/`, { method: 'DELETE' }),

  // Blog Management
  getBlogs: () =>
    requestApi('/api/blogs/', { method: 'GET' }),

  createBlog: (data: any) =>
    requestApi('/api/blogs/', { method: 'POST', body: JSON.stringify(data) }),

  updateBlog: (id: string | number, data: any) =>
    requestApi(`/api/blogs/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteBlog: (id: string | number) =>
    requestApi(`/api/blogs/${id}/`, { method: 'DELETE' }),

  // Success Stories Management
  getStories: () =>
    requestApi('/api/stories/', { method: 'GET' }),

  createStory: (data: any) =>
    requestApi('/api/stories/', { method: 'POST', body: JSON.stringify(data) }),

  updateStory: (id: string | number, data: any) =>
    requestApi(`/api/stories/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteStory: (id: string | number) =>
    requestApi(`/api/stories/${id}/`, { method: 'DELETE' }),

  // Settings Management
  getSettings: () =>
    requestApi('/api/settings/', { method: 'GET' }),

  updateSettings: (data: any) =>
    requestApi('/api/settings/', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;

