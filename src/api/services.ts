import { apiClient, refreshAccessToken } from "./http";
import type { ApiRequestOptions } from "./http";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
} from "./token-store";
import type {
  User,
  Property,
  Booking,
  Favorite,
  LeadPayload,
  DashboardResponse,
} from "../types/database";


export interface PlatformListing {
  platform:
    | "Airbnb"
    | "Vrbo"
    | "Booking.com"
    | "Zillow"
    | "Direct Website"
    | "Custom"
    | string;
  url: string;
  isActive: boolean;
}

export interface PropertyFilters {
  [key: string]: string | number | boolean | undefined | null;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_rent?: number;
  max_rent?: number;
  check_in?: string;
  check_out?: string;
  status?: string;
  sort?: "newest" | "rent_low" | "rent_high" | "profit";
  search?: string;
  property_type?: string;
}

export type PropertyPayload = Omit<
  Property,
  "id" | "created_at" | "updated_at" | "owner"
> & { listings?: PlatformListing[] };

type RequestOpts = Pick<
  ApiRequestOptions,
  "signal" | "timeoutMs" | "onSessionExpired"
>;

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}


function extractArray<T>(res: any, context = "unknown endpoint"): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    for (const key of [
      "results",
      "data",
      "items",
      "properties",
      "bookings",
      "favorites",
    ]) {
      if (Array.isArray(res[key])) return res[key];
    }
  }
  console.error(
    `[extractArray] ${context}: expected an array or a known wrapper key, got:`,
    res,
  );
  return [];
}


export const authService = {
  async login(credentials: LoginCredentials, opts?: RequestOpts): Promise<User> {
    const identifier = credentials.username || credentials.email;
    if (!credentials.password || !identifier) {
      throw new Error(
        "An email or username and a password are required to log in.",
      );
    }
    const payload = {
      username: credentials.username || identifier,
      email: credentials.email || identifier,
      password: credentials.password,
    };
    const response = await apiClient<{
      access: string;
      refresh?: string;
      user: User;
    }>("/api/login/", {
      method: "POST",
      body: JSON.stringify(payload),
      ...opts,
    });
    setAccessToken(response.access);
    if (response.refresh) setRefreshToken(response.refresh);
    return response.user;
  },

  async logout(opts?: RequestOpts): Promise<void> {
    try {
      const refresh = getRefreshToken();
      await apiClient<void>("/api/logout/", {
        method: "POST",
        ...(refresh ? { body: JSON.stringify({ refresh }) } : {}),
        ...opts,
      });
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
    }
  },

  async restoreSession(): Promise<boolean> {
    const existingToken = getAccessToken();
    if (existingToken) {
      try {
        await apiClient<User>("/api/me/", { method: "GET" });
        return true;
      } catch {
        // Token might be expired — fall through to refresh
      }
    }
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

  async register(
    data: {
      username: string;
      email?: string;
      password: string;
      first_name?: string;
      last_name?: string;
    },
    opts?: RequestOpts,
  ): Promise<User> {
    const response = await apiClient<{
      access: string;
      refresh?: string;
      user: User;
    }>("/api/register/", {
      method: "POST",
      body: JSON.stringify(data),
      ...opts,
    });
    if (response.access) setAccessToken(response.access);
    if (response.refresh) setRefreshToken(response.refresh);
    return response.user || (response as unknown as User);
  },

  async requestPasswordReset(email: string, opts?: RequestOpts): Promise<void> {
    return apiClient<void>("/api/password-reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
      ...opts,
    });
  },

  async confirmPasswordReset(data: any, opts?: RequestOpts): Promise<void> {
    return apiClient<void>("/api/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify(data),
      ...opts,
    });
  },

  async uploadAvatar(file: File, opts?: RequestOpts): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient<User>("/api/me/avatar/", {
      method: "POST",
      body: formData,
      ...opts,
    });
  },
};


export const propertyService = {

  async getProperties(
    filters?: PropertyFilters,
    opts?: RequestOpts,
  ): Promise<Property[]> {
    const res = await apiClient<any>("/api/properties/", {
      method: "GET",
      params: filters,
      ...opts,
    });
    return extractArray<Property>(res, "GET /api/properties/");
  },

  async searchProperties(
    filters?: PropertyFilters,
    opts?: RequestOpts,
  ): Promise<Property[]> {
    const params: Record<string, any> = {};
    if (filters?.city)       params.city       = filters.city;
    if (filters?.state)      params.state      = filters.state;
    if (filters?.lat)        params.lat        = filters.lat;
    if (filters?.lng)        params.lng        = filters.lng;
    if (filters?.radius_km)  params.radius_km  = filters.radius_km;
    if (filters?.bedrooms)   params.bedrooms   = filters.bedrooms;
    if (filters?.bathrooms)  params.bathrooms  = filters.bathrooms;
    if (filters?.min_rent)   params.min_rent   = filters.min_rent;
    if (filters?.max_rent)   params.max_rent   = filters.max_rent;
    if (filters?.check_in)   params.check_in   = filters.check_in;
    if (filters?.check_out)  params.check_out  = filters.check_out;
    if (filters?.status)     params.status     = filters.status;
    if (filters?.sort)       params.sort       = filters.sort;

    const res = await apiClient<any>("/api/properties/search/", {
      method: "GET",
      params,
      ...opts,
    });
    return extractArray<Property>(res, "GET /api/properties/search/");
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

  async getSimilarProperties(
    id: string | number,
    opts?: RequestOpts,
  ): Promise<Property[]> {
    const res = await apiClient<any>(`/api/properties/${id}/similar/`, {
      method: "GET",
      ...opts,
    });
    return extractArray<Property>(res, `GET /api/properties/${id}/similar/`);
  },


  async getAvailability(
    id: string | number,
    opts?: RequestOpts,
  ): Promise<{ property_id: number; booked_ranges: { check_in: string; check_out: string }[] }> {
    return apiClient(`/api/properties/${id}/availability/`, {
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

  async updateProperty(
    id: string | number,
    data: Partial<PropertyPayload>,
    opts?: RequestOpts,
  ): Promise<Property> {
    return apiClient<Property>(`/api/properties/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...opts,
    });
  },

  async deleteProperty(id: string | number, opts?: RequestOpts): Promise<void> {
    return apiClient<void>(`/api/properties/${id}/`, {
      method: "DELETE",
      ...opts,
    });
  },

  async uploadPropertyImages(
    id: string | number,
    files: File[],
    opts?: RequestOpts,
  ): Promise<Property> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return apiClient<Property>(`/api/properties/${id}/images/`, {
      method: "POST",
      body: formData,
      ...opts,
    });
  },


  async deletePropertyImage(
    mediaId: string | number,
    opts?: RequestOpts,
  ): Promise<void> {
    return apiClient<void>(`/api/media/${mediaId}/`, {
      method: "DELETE",
      ...opts,
    });
  },

};


export const bookingService = {

  async lockProperty(
    propertyId: string | number,
    data: { check_in?: string; check_out?: string },
    opts?: RequestOpts,
  ): Promise<{ booking_id: number; status: string; check_in?: string; check_out?: string }> {
    return apiClient(`/api/properties/${propertyId}/lock/`, {
      method: "POST",
      body: JSON.stringify(data),
      ...opts,
    });
  },


  async createPaymentIntent(
    bookingId: string | number,
    opts?: RequestOpts,
  ): Promise<{ clientSecret: string; mock?: boolean }> {
    return apiClient(`/api/bookings/${bookingId}/payment-intent/`, {
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
    const res = await apiClient<any>("/api/me/bookings/", {
      method: "GET",
      ...opts,
    });
    return extractArray<Booking>(res, "GET /api/me/bookings/");
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
    const res = await apiClient<any>("/api/me/favorites/", {
      method: "GET",
      ...opts,
    });
    return extractArray<Favorite>(res, "GET /api/me/favorites/");
  },
};


export const leadService = {
  async submitLead(
    data: LeadPayload,
    opts?: RequestOpts,
  ): Promise<{ success: boolean; id: string | number; message?: string }> {
    return apiClient("/api/leads/", {
      method: "POST",
      body: JSON.stringify(data),
      ...opts,
    });
  },
};


export const dashboardService = {
  async getDashboard(opts?: RequestOpts): Promise<DashboardResponse> {
    return apiClient<DashboardResponse>("/api/me/dashboard/", {
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


export const adminService = {
  async getUsers(opts?: RequestOpts): Promise<User[]> {
    const res = await apiClient<any>("/api/admin/users/", {
      method: "GET",
      ...opts,
    });
    return extractArray<User>(res, "GET /api/admin/users/");
  },

  async getBookings(opts?: RequestOpts): Promise<Booking[]> {
    const res = await apiClient<any>("/api/admin/bookings/", {
      method: "GET",
      ...opts,
    });
    return extractArray<Booking>(res, "GET /api/admin/bookings/");
  },

  async getLeads(opts?: RequestOpts): Promise<LeadPayload[]> {
    const res = await apiClient<any>("/api/admin/leads/", {
      method: "GET",
      ...opts,
    });
    return extractArray<LeadPayload>(res, "GET /api/admin/leads/");
  },
};
