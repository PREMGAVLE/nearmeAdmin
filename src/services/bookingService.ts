import apiClient from '@/lib/apiClient';
import type { Booking, PaginatedResponse, BookingFilters } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const bookingService = {
  getAll: async (params?: BookingFilters): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, bookingStatus: Booking['bookingStatus']): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { bookingStatus });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: Booking['paymentStatus']): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/payment-status`, { paymentStatus });
    return response.data;
  },
};

export function useBookings(params?: BookingFilters) {
  return useQuery({ queryKey: ['bookings', params], queryFn: () => bookingService.getAll(params) });
}

export function useBooking(id: string) {
  return useQuery({ queryKey: ['bookings', id], queryFn: () => bookingService.getById(id), enabled: !!id });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, bookingStatus }: { id: string; bookingStatus: Booking['bookingStatus'] }) =>
      bookingService.updateStatus(id, bookingStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useUpdateBookingPaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: Booking['paymentStatus'] }) =>
      bookingService.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
