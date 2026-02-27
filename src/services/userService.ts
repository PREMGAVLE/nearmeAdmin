import apiClient from '@/lib/apiClient';
import type { User, PaginatedResponse, UserFilters, Subscription } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const userService = {
  getAll: async (params?: UserFilters): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (payload: Partial<User>): Promise<User> => {
    const response = await apiClient.post('/users', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  toggleBlock: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/toggle-block`);
    return response.data.data;
  },

  activateSubscription: async (id: string, subscription: Partial<Subscription>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/activate-subscription`, { subscription });
    return response.data.data;
  },
};

// ===== React Query Hooks =====
export function useUsers(params?: UserFilters) {
  return useQuery({ queryKey: ['users', params], queryFn: () => userService.getAll(params) });
}

export function useUser(id: string) {
  return useQuery({ queryKey: ['users', id], queryFn: () => userService.getById(id), enabled: !!id });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => userService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useToggleBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.toggleBlock(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useActivateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, subscription }: { id: string; subscription: Partial<Subscription> }) =>
      userService.activateSubscription(id, subscription),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
