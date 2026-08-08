import { apiClient as requestApi } from '../lib/api/client';
import type { ApiRequestOptions } from '../lib/api/client';
import {
  authService,
  propertyService,
  bookingService,
  favoriteService,
  leadService,
  adminService,
} from '../lib/api/services';
import type { LoginCredentials, PropertyPayload, PropertyFilters } from '../lib/api/services';
import type { User } from '../types/database';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

export async function apiRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  return requestApi<T>(endpoint, options);
}

// Unified API Service Object for backwards compatibility & clean modular imports
export const api = {
  // Auth & Profile
  login: (credentials: LoginCredentials) => authService.login(credentials),
  logout: () => authService.logout(),
  getUserProfile: () => authService.getProfile(),
  updateUserProfile: (data: Partial<User>) => authService.updateProfile(data),

  // Properties & Discovery
  getProperties: (params?: PropertyFilters) => propertyService.getProperties(params),
  getPropertyDetails: (id: string | number) => propertyService.getPropertyById(id),
  createProperty: (data: PropertyPayload) => propertyService.createProperty(data),

  // Favorites
  getFavorites: () => favoriteService.getFavorites(),
  addFavorite: (propertyId: string | number) => favoriteService.addFavorite(propertyId),
  removeFavorite: (propertyId: string | number) => favoriteService.removeFavorite(propertyId),
  toggleFavorite: (propertyId: string | number) => favoriteService.toggleFavorite(propertyId),

  // Lock & Purchase
  lockProperty: (propertyId: string | number) => bookingService.lockProperty(propertyId),
  purchaseProperty: (bookingId: string | number) => bookingService.purchaseBooking(bookingId),
  cancelBooking: (bookingId: string | number) => bookingService.cancelBooking(bookingId),
  getMyBookings: () => bookingService.getUserBookings(),

  // Dashboard & Leads
  getDashboard: () => adminService.getDashboard(),
  getDashboardSummary: () => adminService.getDashboardSummary(),
  submitLead: (data: {
    name?: string;
    email?: string;
    phone?: string;
    phone_number?: string;
    message?: string;
    propertyId?: string | number | null;
    property_reference?: string | number | null;
  }) =>
    leadService.submitLead({
      name: data.name || '',
      email: data.email || '',
      phone_number: data.phone || data.phone_number || '',
      message: data.message || '',
      property_reference: data.propertyId ?? data.property_reference ?? null,
    }),
  getLeads: () => leadService.getLeads(),
  deleteLead: (id: string | number) => leadService.deleteLead(id),


  //ADD THESE in backend
  getBlogs: () => requestApi('/api/blogs/', { method: 'GET' }),
  createBlog: (data: unknown) => requestApi('/api/blogs/', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id: string | number, data: unknown) =>
    requestApi(`/api/blogs/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlog: (id: string | number) => requestApi(`/api/blogs/${id}/`, { method: 'DELETE' }),

  getStories: () => requestApi('/api/stories/', { method: 'GET' }),
  createStory: (data: unknown) => requestApi('/api/stories/', { method: 'POST', body: JSON.stringify(data) }),
  updateStory: (id: string | number, data: unknown) =>
    requestApi(`/api/stories/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStory: (id: string | number) => requestApi(`/api/stories/${id}/`, { method: 'DELETE' }),

  getSettings: () => requestApi('/api/settings/', { method: 'GET' }),
  updateSettings: (data: unknown) => requestApi('/api/settings/', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;
