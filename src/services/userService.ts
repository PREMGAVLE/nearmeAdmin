import apiClient from '@/lib/apiClient';
import type { User, PaginatedResponse, UserFilters, Subscription } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const userService = {
  // ✅ FIXED: Use correct backend endpoint
  getAll: async (params?: UserFilters): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // ✅ NEW: Get user by ID with details
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // ✅ FIXED: Use correct create endpoint
  create: async (payload: Partial<User>): Promise<User> => {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  // ✅ NEW: Update user status
  updateStatus: async (id: string, status: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },

 // ✅ FIXED: Better error handling and logging
getUserBusinesses: async (userId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    console.log('User response:', response.data); // Debug log
    const businesses = response.data.recentBusinesses || [];
    console.log('Businesses found:', businesses); // Debug log
    return businesses;
  } catch (error) {
    console.error('Error fetching user businesses:', error);
    return [];
  }
},

getUserLeads: async (userId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    console.log('User response for leads:', response.data); // Debug log
    const leads = response.data.recentLeads || [];
    console.log('Leads found:', leads); // Debug log
    return leads;
  } catch (error) {
    console.error('Error fetching user leads:', error);
    return [];
  }
},

  // ✅ NEW: Update user role
  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  // ✅ FIXED: Use correct delete endpoint
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // ✅ NEW: Bulk operations
  bulkAction: async (action: string, userIds: string[], data?: any): Promise<any> => {
    const response = await apiClient.post('/users/bulk-action', { action, userIds, data });
    return response.data;
  },

  // ✅ NEW: Export users
  export: async (params?: any): Promise<Blob> => {
    const response = await apiClient.get('/users/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // ✅ NEW: Get user activity log
  getActivityLog: async (id: string, params?: any): Promise<any> => {
    const response = await apiClient.get(`/users/${id}/activity`, { params });
    return response.data;
  },

  // ✅ DEPRECATED: Old toggle block (keep for compatibility)
  toggleBlock: async (id: string): Promise<User> => {
    const user = await userService.getById(id);
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    return userService.updateStatus(id, newStatus);
  },

  // ✅ DEPRECATED: Old subscription (keep for compatibility)
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

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => userService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userService.updateRole(id, role),
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

export function useBulkAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ action, userIds, data }: { action: string; userIds: string[]; data?: any }) =>
      userService.bulkAction(action, userIds, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useExportUsers() {
  return useMutation({
    mutationFn: (params?: any) => userService.export(params),
  });
}

export function useUserActivityLog() {
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params?: any }) => userService.getActivityLog(id, params),
  });
}

// ✅ DEPRECATED: Keep for compatibility
export function useToggleBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.toggleBlock(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
export function useUserBusinesses(userId: string) {
  return useQuery({ 
    queryKey: ['user-businesses', userId], 
    queryFn: () => userService.getUserBusinesses(userId), 
    enabled: !!userId 
  });
}
 
export function useUserLeads(userId: string) {
  return useQuery({ 
    queryKey: ['user-leads', userId], 
    queryFn: () => userService.getUserLeads(userId), 
    enabled: !!userId 
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