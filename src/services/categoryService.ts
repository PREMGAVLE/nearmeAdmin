import apiClient from '@/lib/apiClient';
import type { Category, CategoryFilters, PaginatedResponse, PaginationParams } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const categoryService = {
  getAll: async (params?: CategoryFilters): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/categories/public', { params });
    return response.data;
  },

  create: async (payload: { 
    name: string; 
    section: 'BUSINESS' | 'SERVICE'; 
    isTrending?: boolean;
    iconKey?: string;
  }): Promise<Category> => {
    const response = await apiClient.post('/categories', payload);
    return response.data;
  },

  update: async (id: string, payload: { 
    name: string; 
    section?: 'BUSINESS' | 'SERVICE'; 
    isTrending?: boolean;
    iconKey?: string;
  }): Promise<Category> => {
   const response = await apiClient.patch(`/categories/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // New approval functions
  approveCategory: async (id: string): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}/approve`);
    return response.data;
  },

  rejectCategory: async (id: string, reason?: string): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}/reject`, { rejectionReason: reason });
    return response.data;
  },
};

export function useCategories(params?: CategoryFilters) {
  return useQuery({ queryKey: ['categories', params], queryFn: () => categoryService.getAll(params) });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { 
      name: string; 
      section: 'BUSINESS' | 'SERVICE'; 
      isTrending?: boolean;
      iconKey?: string;
    }) => categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, 
      name, 
      section, 
      isTrending, 
      iconKey 
    }: { 
      id: string; 
      name: string; 
      section?: 'BUSINESS' | 'SERVICE'; 
      isTrending?: boolean;
      iconKey?: string;
    }) => categoryService.update(id, { name, section, isTrending, iconKey }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// New approval hooks
export function useApproveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.approveCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useRejectCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => categoryService.rejectCategory(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}