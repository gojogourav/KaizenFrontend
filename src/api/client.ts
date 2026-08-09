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
import type { User, LeadPayload } from "../types/database";

export const api = {
  login: (credentials: LoginCredentials) => authService.login(credentials),
  register: (data: { username: string; email?: string; password: string; first_name?: string; last_name?: string }) =>
    authService.register(data),
  logout: () => authService.logout(),
  restoreSession: () => authService.restoreSession(),
  getUserProfile: () => authService.getProfile(),
  updateUserProfile: (data: Partial<User>) => authService.updateProfile(data),

  getProperties: (params?: PropertyFilters) =>
    propertyService.getProperties(params),
  getPropertyDetails: (id: string | number) =>
    propertyService.getPropertyById(id),
  createProperty: (data: PropertyPayload) =>
    propertyService.createProperty(data),

  getFavorites: () => favoriteService.getFavorites(),
  addFavorite: (propertyId: string | number) =>
    favoriteService.addFavorite(propertyId),
  removeFavorite: (propertyId: string | number) =>
    favoriteService.removeFavorite(propertyId),

  lockProperty: (propertyId: string | number) =>
    bookingService.lockProperty(propertyId),
  purchaseProperty: (bookingId: string | number) =>
    bookingService.purchaseBooking(bookingId),
  cancelBooking: (bookingId: string | number) =>
    bookingService.cancelBooking(bookingId),
  getMyBookings: () => bookingService.getUserBookings(),

  getDashboard: () => dashboardService.getDashboard(),
  getDashboardSummary: () => dashboardService.getDashboardSummary(),

  submitLead: (data: LeadPayload) => leadService.submitLead(data),
};

export default api;
