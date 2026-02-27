import apiClient from '@/lib/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface AdminCreatePayload {
  action: 'create_admin';
  name: string;
  mobile: string;
  email: string;
  password: string;
}

// Create a custom axios instance for admin calls to handle auth gracefully
const adminApiClient = axios.create({
  baseURL: 'http://localhost:5001/api/smart/',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to admin requests
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartburhanpur_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors for admin calls without global redirect
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401, just pass the error through
    return Promise.reject(error);
  }
);

export const adminService = {
  createAdmin: async (payload: AdminCreatePayload) => {
    try {
      const response = await adminApiClient.post('/admin/manage-users', payload);
      return response.data;
    } catch (error: any) {
      // Provide better error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your login session and try again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Only super admins can create new admins.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        throw new Error('Failed to create admin. Please try again.');
      }
    }
  }
};

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}