import { apiClient, refreshAccessToken } from './client';
import type { ApiRequestOptions } from './client';
import { setAccessToken } from './token_store';
import { User, Property, Booking, Favorite, Lead, LeadPayload } from '../../types/database';
import { DashboardResponse } from '@/src/types/dashboard';

export type PropertyPayload = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'owner'>;
type RequestOpts = Pick<ApiRequestOptions, 'signal' | 'timeoutMs' | 'onSessionExpired'>;

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials, opts?: RequestOpts): Promise<User> {
    if (!credentials.password || !(credentials.email || credentials.username)) {
      throw new Error('An email or username and a password are required to log in.');
    }

    const response = await apiClient<{ access: string; user: User }>('/api/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
      ...opts,
    });

    setAccessToken(response.access);
    return response.user;
  },

  async logout(opts?: RequestOpts): Promise<void> {
    try {
      await apiClient<void>('/api/logout/', { method: 'POST', ...opts });
    } finally {
      setAccessToken(null);
    }
  },

  async restoreSession(): Promise<boolean> {
    const token = await refreshAccessToken();
    return token !== null;
  },

  async getProfile(opts?: RequestOpts): Promise<User> {
    return apiClient<User>('/api/me/', { method: 'GET', ...opts });
  },

  async updateProfile(data: Partial<User>, opts?: RequestOpts): Promise<{ user: User }> {
    return apiClient<{ user: User }>('/api/me/', { method: 'PATCH', body: JSON.stringify(data), ...opts });
  },
};

export interface PropertyFilters {
  city?: string;
  status?: string;
  property_type?: string;
  search?: string;
}

export const propertyService = {
  async getProperties(filters?: PropertyFilters, opts?: RequestOpts): Promise<Property[]> {
    return apiClient<Property[]>('/api/properties/', { method: 'GET', params: filters, ...opts });
  },

  async getPropertyById(id: string | number, opts?: RequestOpts): Promise<Property> {
    return apiClient<Property>(`/api/properties/${id}/`, { method: 'GET', ...opts });
  },


  async createProperty(data: PropertyPayload, opts?: RequestOpts): Promise<Property> {
    return apiClient<Property>('/api/properties/', { method: 'POST', body: JSON.stringify(data), ...opts });
  },

  //TODO: add these two in backend
  async updateProperty(id: string | number, data: Partial<PropertyPayload>, opts?: RequestOpts): Promise<Property> {
    return apiClient<Property>(`/api/properties/${id}/`, { method: 'PUT', body: JSON.stringify(data), ...opts });
  },

  async deleteProperty(id: string | number, opts?: RequestOpts): Promise<void> {
    return apiClient<void>(`/api/properties/${id}/`, { method: 'DELETE', ...opts });
  },
};

export const bookingService = {
  async lockProperty(propertyId: string | number, opts?: RequestOpts): Promise<Booking> {
    return apiClient<Booking>(`/api/properties/${propertyId}/lock/`, { method: 'POST', ...opts });
  },

  async purchaseBooking(bookingId: string | number, opts?: RequestOpts): Promise<Booking> {
    return apiClient<Booking>(`/api/bookings/${bookingId}/purchase/`, { method: 'POST', ...opts });
  },

  async cancelBooking(bookingId: string | number, opts?: RequestOpts): Promise<Booking> {
    return apiClient<Booking>(`/api/bookings/${bookingId}/cancel/`, { method: 'POST', ...opts });
  },

  async getUserBookings(opts?: RequestOpts): Promise<Booking[]> {
    return apiClient<Booking[]>('/api/me/bookings/', { method: 'GET', ...opts });
  },
};

export const favoriteService = {
  async toggleFavorite(propertyId: string | number, opts?: RequestOpts): Promise<{ is_favorited: boolean }> {
    return apiClient<{ is_favorited: boolean }>(`/api/properties/${propertyId}/favorite/`, { method: 'POST', ...opts });
  },

  async addFavorite(propertyId: string | number, opts?: RequestOpts): Promise<Favorite> {
    return apiClient<Favorite>(`/api/properties/${propertyId}/favorite/`, { method: 'POST', ...opts });
  },

  async removeFavorite(propertyId: string | number, opts?: RequestOpts): Promise<void> {
    return apiClient<void>(`/api/properties/${propertyId}/favorite/`, { method: 'DELETE', ...opts });
  },

  async getFavorites(opts?: RequestOpts): Promise<Favorite[]> {
    return apiClient<Favorite[]>('/api/me/favorites/', { method: 'GET', ...opts });
  },
};

export const leadService = {
  async submitLead(data: LeadPayload, opts?: RequestOpts): Promise<{ success: boolean; id: string | number; message?: string }> {
    return apiClient<{ success: boolean; id: string | number; message?: string }>('/api/leads/', { method: 'POST', body: JSON.stringify(data), ...opts });
  },

  async getLeads(opts?: RequestOpts): Promise<Lead[]> {
    return apiClient<Lead[]>('/api/leads/', { method: 'GET', ...opts });
  },

  async deleteLead(id: string | number, opts?: RequestOpts): Promise<void> {
    return apiClient<void>(`/api/leads/${id}/`, { method: 'DELETE', ...opts });
  },
};

export const adminService = {
  async getDashboard(opts?: RequestOpts): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>('/api/me/dashboard/', { method: 'GET', ...opts });
  },

  async getDashboardSummary(opts?: RequestOpts): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>('/api/me/summary/', { method: 'GET', ...opts });
  },

  //TODO:  add these in backend
  getBlogs: (opts?: RequestOpts) => apiClient<any>('/api/blogs/', { method: 'GET', ...opts }),
  createBlog: (data: any, opts?: RequestOpts) => apiClient<any>('/api/blogs/', { method: 'POST', body: JSON.stringify(data), ...opts }),
  updateBlog: (id: string | number, data: any, opts?: RequestOpts) => apiClient<any>(`/api/blogs/${id}/`, { method: 'PUT', body: JSON.stringify(data), ...opts }),
  deleteBlog: (id: string | number, opts?: RequestOpts) => apiClient<void>(`/api/blogs/${id}/`, { method: 'DELETE', ...opts }),

  getStories: (opts?: RequestOpts) => apiClient<any>('/api/stories/', { method: 'GET', ...opts }),
  createStory: (data: any, opts?: RequestOpts) => apiClient<any>('/api/stories/', { method: 'POST', body: JSON.stringify(data), ...opts }),
  updateStory: (id: string | number, data: any, opts?: RequestOpts) => apiClient<any>(`/api/stories/${id}/`, { method: 'PUT', body: JSON.stringify(data), ...opts }),
  deleteStory: (id: string | number, opts?: RequestOpts) => apiClient<void>(`/api/stories/${id}/`, { method: 'DELETE', ...opts }),

  getSettings: (opts?: RequestOpts) => apiClient<any>('/api/settings/', { method: 'GET', ...opts }),
  updateSettings: (data: any, opts?: RequestOpts) => apiClient<any>('/api/settings/', { method: 'POST', body: JSON.stringify(data), ...opts }),
};
