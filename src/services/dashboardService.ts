import apiClient from '@/lib/apiClient';
import type { DashboardStats } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const dashboardService = {
  getStats: async (role?: string, userId?: string): Promise<DashboardStats> => {
    const response = await apiClient.get('/analytics/overview', { params: { role, userId } });
    // Extract data from the response structure
    return response.data.data || response.data;
  },
};

export function useDashboardStats(role?: string, userId?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', role, userId],
    queryFn: () => dashboardService.getStats(role, userId),
    refetchInterval: 30000,
  });
}