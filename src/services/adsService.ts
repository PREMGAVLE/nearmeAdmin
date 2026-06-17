import apiClient from '@/lib/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Ad, AdFormData, AdFilters, PaginatedResponse } from '@/types';

export const adsService = {
    getAds: async (filters: AdFilters) => {
        const response = await apiClient.get('/ads', { params: filters });
        return response.data;
    },

    createAd: async (payload: AdFormData) => {
        // Map frontend 'type' to backend 'adType'
        const backendPayload = {
            ...payload,
            adType: payload.type
        };
        delete backendPayload.type;
        const response = await apiClient.post('/ads', backendPayload);
        return response.data;
    },

    updateAd: async (id: string, payload: Partial<AdFormData>) => {
        // Map frontend 'type' to backend 'adType'
        const backendPayload = {
            ...payload,
            adType: payload.type
        };
        if (backendPayload.type) delete backendPayload.type;
        const response = await apiClient.patch(`/ads/${id}`, backendPayload);
        return response.data;
    },

    deleteAd: async (id: string) => {
        const response = await apiClient.delete(`/ads/${id}`);
        return response.data;
    },

    toggleAdStatus: async (id: string) => {
        const response = await apiClient.patch(`/ads/${id}/activate`, { isActive: true });
        return response.data;
    },

    uploadAdImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post('/ads/upload', formData, {
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