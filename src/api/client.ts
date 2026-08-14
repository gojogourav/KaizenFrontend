import {
  authService,
  propertyService,
  bookingService,
  favoriteService,
  leadService,
  dashboardService,
} from "./services";
import type {
  LoginCredentials,
  PropertyPayload,
  PropertyFilters,
} from "./services";
import type { ApiRequestOptions } from "./http";
import type { User, LeadPayload } from "../types/database";

type RequestOpts = Pick<
  ApiRequestOptions,
  "signal" | "timeoutMs" | "onSessionExpired"
>;

export const api = {
  login: (credentials: LoginCredentials, opts?: RequestOpts) =>
    authService.login(credentials, opts),
  register: (
    data: {
      username: string;
      email?: string;
      password: string;
      first_name?: string;
      last_name?: string;
    },
    opts?: RequestOpts,
  ) => authService.register(data, opts),
  logout: (opts?: RequestOpts) => authService.logout(opts),
  restoreSession: () => authService.restoreSession(),
  getUserProfile: (opts?: RequestOpts) => authService.getProfile(opts),
  updateUserProfile: (data: Partial<User>, opts?: RequestOpts) =>
    authService.updateProfile(data, opts),

  getProperties: (params?: PropertyFilters, opts?: RequestOpts) =>
    propertyService.getProperties(params, opts),
  getPropertyDetails: (id: string | number, opts?: RequestOpts) =>
    propertyService.getPropertyById(id, opts),
  createProperty: (data: PropertyPayload, opts?: RequestOpts) =>
    propertyService.createProperty(data, opts),

  getFavorites: (opts?: RequestOpts) => favoriteService.getFavorites(opts),
  addFavorite: (propertyId: string | number, opts?: RequestOpts) =>
    favoriteService.addFavorite(propertyId, opts),
  removeFavorite: (propertyId: string | number, opts?: RequestOpts) =>
    favoriteService.removeFavorite(propertyId, opts),

  lockProperty: (propertyId: string | number, opts?: RequestOpts) =>
    bookingService.lockProperty(propertyId, opts),
  purchaseProperty: (bookingId: string | number, opts?: RequestOpts) =>
    bookingService.purchaseBooking(bookingId, opts),
  cancelBooking: (bookingId: string | number, opts?: RequestOpts) =>
    bookingService.cancelBooking(bookingId, opts),
  getMyBookings: (opts?: RequestOpts) => bookingService.getUserBookings(opts),

  getDashboard: (opts?: RequestOpts) => dashboardService.getDashboard(opts),
  getDashboardSummary: (opts?: RequestOpts) =>
    dashboardService.getDashboardSummary(opts),

  submitLead: (data: LeadPayload, opts?: RequestOpts) =>
    leadService.submitLead(data, opts),
};

export default api;
