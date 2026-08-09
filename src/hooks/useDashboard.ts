import { api } from '../api/client';
import { useAsync } from './useAsync';
import type { DashboardResponse } from '../types/database';

export function useDashboard() {
  const { data, loading, error, refetch } = useAsync<DashboardResponse>(() => api.getDashboard(), []);
  return { dashboard: data, loading, error, refetch };
}
