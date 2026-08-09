import { apiClient, refreshAccessToken } from "./http";
import type { ApiRequestOptions } from "./http";
import { setAccessToken } from "./token-store";
import type {
  User,
  Property,
  Booking,
  Favorite,
  LeadPayload,
  DashboardResponse,
} from "../types/database";

export type PropertyPayload = Omit<
  Property,
  "id" | "created_at" | "updated_at" | "owner"
>;
type RequestOpts = Pick<
  ApiRequestOptions,
  "signal" | "timeoutMs" | "onSessionExpired"
>;

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export const authService = {
  async login(
    credentials: LoginCredentials,
    opts?: RequestOpts,
  ): Promise<User> {
    if (!credentials.password || !(credentials.email || credentials.username)) {
      throw new Error(
        "An email or username and a password are required to log in.",
      );
    }
    const response = await apiClient<{ access: string; user: User }>(
      "/api/login/",
      {
        method: "POST",
        body: JSON.stringify(credentials),
        ...opts,
      },
    );
    setAccessToken(response.access);
    return response.user;
  },

  async logout(opts?: RequestOpts): Promise<void> {
    try {
      await apiClient<void>("/api/logout/", { method: "POST", ...opts });
    } finally {
      setAccessToken(null);
    }
  },

  async restoreSession(): Promise<boolean> {
    return (await refreshAccessToken()) !== null;
  },

  async getProfile(opts?: RequestOpts): Promise<User> {
    return apiClient<User>("/api/me/", { method: "GET", ...opts });
  },

  async updateProfile(data: Partial<User>, opts?: RequestOpts): Promise<User> {
    return apiClient<User>("/api/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
      ...opts,
    });
  },
};

export interface PropertyFilters {
  city?: string;
  status?: string;
  property_type?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
}

export const propertyService = {
  async getProperties(
    filters?: PropertyFilters,
    opts?: RequestOpts,
  ): Promise<Property[]> {
    return apiClient<Property[]>("/api/properties/", {
      method: "GET",
      params: filters,
      ...opts,
    });
  },

  async getPropertyById(
    id: string | number,
    opts?: RequestOpts,
  ): Promise<Property> {
    return apiClient<Property>(`/api/properties/${id}/`, {
      method: "GET",
      ...opts,
    });
  },

  async createProperty(
    data: PropertyPayload,
    opts?: RequestOpts,
  ): Promise<Property> {
    return apiClient<Property>("/api/properties/", {
      method: "POST",
      body: JSON.stringify(data),
      ...opts,
    });
  },
};

export const bookingService = {
  async lockProperty(
    propertyId: string | number,
    opts?: RequestOpts,
  ): Promise<Booking> {
    return apiClient<Booking>(`/api/properties/${propertyId}/lock/`, {
      method: "POST",
      ...opts,
    });
  },

  async purchaseBooking(
    bookingId: string | number,
    opts?: RequestOpts,
  ): Promise<Booking> {
    return apiClient<Booking>(`/api/bookings/${bookingId}/purchase/`, {
      method: "POST",
      ...opts,
    });
  },

  async cancelBooking(
    bookingId: string | number,
    opts?: RequestOpts,
  ): Promise<Booking> {
    return apiClient<Booking>(`/api/bookings/${bookingId}/cancel/`, {
      method: "POST",
      ...opts,
    });
  },

  async getUserBookings(opts?: RequestOpts): Promise<Booking[]> {
    return apiClient<Booking[]>("/api/me/bookings/", {
      method: "GET",
      ...opts,
    });
  },
};

export const favoriteService = {
  async addFavorite(
    propertyId: string | number,
    opts?: RequestOpts,
  ): Promise<Favorite> {
    return apiClient<Favorite>(`/api/properties/${propertyId}/favorite/`, {
      method: "POST",
      ...opts,
    });
  },

  async removeFavorite(
    propertyId: string | number,
    opts?: RequestOpts,
  ): Promise<void> {
    return apiClient<void>(`/api/properties/${propertyId}/favorite/`, {
      method: "DELETE",
      ...opts,
    });
  },

  async getFavorites(opts?: RequestOpts): Promise<Favorite[]> {
    return apiClient<Favorite[]>("/api/me/favorites/", {
      method: "GET",
      ...opts,
    });
  },
};

export const leadService = {
  async submitLead(
    data: LeadPayload,
    opts?: RequestOpts,
  ): Promise<{ success: boolean; id: string | number; message?: string }> {
    return apiClient("/api/leads", {
      method: "POST",
      body: JSON.stringify(data),
      ...opts,
    });
  },
};

export const dashboardService = {
  async getDashboard(opts?: RequestOpts): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>("/api/me/dashboard", {
      method: "GET",
      ...opts,
    });
  },

  async getDashboardSummary(opts?: RequestOpts): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>("/api/me/summary/", {
      method: "GET",
      ...opts,
    });
  },
};
