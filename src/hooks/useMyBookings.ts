import { api } from '../api/client';
import { useAsync } from './useAsync';
import type { Booking } from '../types/database';

export function useMyBookings() {
  const { data, loading, error, refetch } = useAsync<Booking[]>(() => api.getMyBookings(), []);
  return { bookings: data || [], loading, error, refetch };
}
