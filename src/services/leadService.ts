import apiClient from '@/lib/apiClient';
import type { Lead, PaginatedResponse, LeadFilters } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const leadService = {
  getAll: async (params?: LeadFilters): Promise<PaginatedResponse<Lead>> => {
    const response = await apiClient.get('/leads', { params });
return response.data.data;
  },

  getById: async (id: string): Promise<Lead> => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  create: async (payload: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.post('/leads', payload);
    return response.data;
  },

  updateStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const response = await apiClient.patch(`/leads/${id}/status`, { status });
    return response.data;
  },

  bulkAssign: async (leadIds: string[], assignedBusinessId: string): Promise<Lead[]> => {
    const response = await apiClient.patch('/leads/bulk-assign', { leadIds, assignedBusinessId });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },
};

export function useLeads(params?: LeadFilters) {
  return useQuery({ queryKey: ['leads', params], queryFn: () => leadService.getAll(params) });
}

export function useLead(id: string) {
  return useQuery({ queryKey: ['leads', id], queryFn: () => leadService.getById(id), enabled: !!id });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) => leadService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useBulkAssignLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadIds, assignedBusinessId }: { leadIds: string[]; assignedBusinessId: string }) =>
      leadService.bulkAssign(leadIds, assignedBusinessId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
