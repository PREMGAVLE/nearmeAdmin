import apiClient from '@/lib/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Ad, AdFormData, AdFilters, PaginatedResponse } from '@/types';

// Create a custom axios instance for ad calls
const adsApiClient = axios.create({
    baseURL: 'https://smartburhanpurcitybackend-production.up.railway.app/api/smart/',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to ad requests
adsApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('smartburhanpur_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors for ad calls without global redirect
adsApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export const adsService = {
    getAds: async (filters: AdFilters) => {
        const response = await adsApiClient.get('/ads', { params: filters });
        return response.data;
    },

    createAd: async (payload: AdFormData) => {
        const response = await adsApiClient.post('/ads', payload);
        return response.data;
    },

    updateAd: async (id: string, payload: Partial<AdFormData>) => {
        const response = await adsApiClient.patch(`/ads/${id}`, payload); // ✅ Change PUT to PATCH
        return response.data;
    },

    deleteAd: async (id: string) => {
        const response = await adsApiClient.delete(`/ads/${id}`);
        return response.data;
    },

    toggleAdStatus: async (id: string) => {
        const response = await adsApiClient.patch(`/ads/${id}/activate`, { isActive: true }); // ✅ Fix endpoint
        return response.data;
    },

    uploadAdImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await adsApiClient.post('/ads/upload', formData, { // ✅ Fix endpoint
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
// Query hooks
export function useAds(filters: AdFilters = {}) {
    return useQuery({
        queryKey: ['ads', filters],
        queryFn: () => adsService.getAds(filters),
        staleTime: 30000,
    });
}

export function useCreateAd() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adsService.createAd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });
}

export function useUpdateAd() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AdFormData> }) =>
            adsService.updateAd(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });
}

export function useDeleteAd() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adsService.deleteAd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });
}

export function useToggleAdStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adsService.toggleAdStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });
}

export function useUploadAdImage() {
    return useMutation({
        mutationFn: adsService.uploadAdImage,
    });
}