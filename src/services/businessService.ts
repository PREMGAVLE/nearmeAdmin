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
    console.log('Approving business:', id);
    const response = await apiClient.patch(`/business/admin/${id}/approve`, {
      approvalStatus: 'approved',
      listingType: 'normal'
    });
    console.log('Approve response:', response.data);
    return response.data;
  },

  reject: async (id: string, rejectionReason: string): Promise<Business> => {
    console.log('Rejecting business:', id, 'reason:', rejectionReason);
    const response = await apiClient.patch(`/business/admin/${id}/approve`, {
      approvalStatus: 'rejected',
      rejectReason: rejectionReason
    });
    console.log('Reject response:', response.data);
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

  getSalesmanBusinesses: async (params?: any): Promise<any> => {
    const response = await apiClient.get(`/business/salesman/my-businesses`, { params });
    // Backend returns { success: true, data: [items] } not paginated
    const items = Array.isArray(response.data.data) ? response.data.data : [];
    return { items, success: true };
  },

  uploadDocument: async (businessId: string, file: File, type: string): Promise<any> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    const response = await apiClient.post(`/business/${businessId}/document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadLogo: async (businessId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/business/${businessId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    onSuccess: (data, variables) => {
      console.log('Approve mutation succeeded, response:', data);
      console.log('Manually updating cache to remove business from pending list');
      // Update all business queries to remove this business from pending lists
      qc.setQueriesData({ queryKey: ['business'] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.data?.items) {
          // Paginated response
          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: oldData.data.items.filter((b: any) => b._id !== variables)
            }
          };
        } else if (Array.isArray(oldData.data)) {
          // Array response
          return {
            ...oldData,
            data: oldData.data.filter((b: any) => b._id !== variables)
          };
        }
        return oldData;
      });
      // Also invalidate to ensure fresh data
      qc.invalidateQueries({ queryKey: ['business'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Approve mutation failed:', error);
    },
  });
}

export function useRejectBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      businessService.reject(id, rejectionReason),
    onSuccess: (data, variables) => {
      console.log('Reject mutation succeeded, response:', data);
      console.log('Manually updating cache to remove business from pending list');
      // Update all business queries to remove this business from pending lists
      qc.setQueriesData({ queryKey: ['business'] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.data?.items) {
          // Paginated response
          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: oldData.data.items.filter((b: any) => b._id !== variables.id)
            }
          };
        } else if (Array.isArray(oldData.data)) {
          // Array response
          return {
            ...oldData,
            data: oldData.data.filter((b: any) => b._id !== variables.id)
          };
        }
        return oldData;
      });
      // Also invalidate to ensure fresh data
      qc.invalidateQueries({ queryKey: ['business'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Reject mutation failed:', error);
    },
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

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ businessId, file, type }: { businessId: string; file: File; type: string }) =>
      businessService.uploadDocument(businessId, file, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ businessId, file }: { businessId: string; file: File }) =>
      businessService.uploadLogo(businessId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

export function useSalesmanBusinesses(params?: any) {
  return useQuery({
    queryKey: ['salesman-businesses', params],
    queryFn: () => businessService.getSalesmanBusinesses(params)
  }) as any;
}