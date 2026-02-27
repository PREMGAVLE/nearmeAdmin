import apiClient from '@/lib/apiClient';
import type { Category, PaginatedResponse, PaginationParams } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const categoryService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  create: async (payload: { name: string }): Promise<Category> => {
    const response = await apiClient.post('/categories', payload);
    return response.data;
  },

  update: async (id: string, payload: { name: string }): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

export function useCategories(params?: PaginationParams) {
  return useQuery({ queryKey: ['categories', params], queryFn: () => categoryService.getAll(params) });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoryService.update(id, { name }),
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
