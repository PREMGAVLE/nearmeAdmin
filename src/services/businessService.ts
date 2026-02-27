import apiClient from '@/lib/apiClient';
import type { Business, PaginatedResponse, BusinessFilters } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const businessService = {
  getAll: async (params?: BusinessFilters): Promise<PaginatedResponse<Business>> => {
    const response = await apiClient.get('/business', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Business> => {
    const response = await apiClient.get(`/business/${id}`);
    return response.data;
  },

  create: async (payload: Partial<Business>): Promise<Business> => {
    const response = await apiClient.post('/business', payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<Business>): Promise<Business> => {
    const response = await apiClient.put(`/business/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/business/${id}`);
  },

  approve: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/admin/${id}/approve`, {
      approvalStatus: 'approved',
      listingType: 'normal'
    });
    return response.data;
  },

  reject: async (id: string, rejectionReason: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/verify`, {
      status: 'rejected',
      note: rejectionReason
    });
    return response.data;
  },

  verifyPayment: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/verify-payment`);
    return response.data;
  },

  toggleVisibility: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/toggle-visibility`);
    return response.data;
  },

  activatePremium: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/premium`, { isPremium: true });
    return response.data;
  },

  deactivatePremium: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/premium`, { isPremium: false });
    return response.data;
  },

  requestPremium: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/request-premium`);
    return response.data;
  },

  approvePremiumRequest: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/approve-premium-request`);
    return response.data;
  },

  rejectPremiumRequest: async (id: string): Promise<Business> => {
    const response = await apiClient.patch(`/business/${id}/reject-premium-request`);
    return response.data;
  },
};

// ===== React Query Hooks =====
export function useBusinesses(params?: BusinessFilters) {
  return useQuery({ queryKey: ['business', params], queryFn: () => businessService.getAll(params) });
}

export function useBusiness(id: string) {
  return useQuery({ queryKey: ['business', id], queryFn: () => businessService.getById(id), enabled: !!id });
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Business>) => businessService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useUpdateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Business> }) => businessService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useDeleteBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useApproveBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useRejectBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      businessService.reject(id, rejectionReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.verifyPayment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useToggleVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.toggleVisibility(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useActivatePremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.activatePremium(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useDeactivatePremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.deactivatePremium(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useRequestPremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.requestPremium(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useApprovePremiumRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.approvePremiumRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useRejectPremiumRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.rejectPremiumRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}
