import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';

export function useUserBookings(userId: string, status?: BookingStatus) {
  const query = status ? `?status=${status}` : '';
  return useQuery({
    queryKey: ['bookings', 'user', userId, status],
    queryFn: () => api.get<Booking[]>(`/bookings/user/${userId}${query}`),
    enabled: !!userId,
  });
}

export function useWorkshopBookings(workshopId: string) {
  return useQuery({
    queryKey: ['bookings', 'workshop', workshopId],
    queryFn: () => api.get<Booking[]>(`/bookings/workshop/${workshopId}`),
    enabled: !!workshopId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      bookerId: string;
      workshopId: string;
      timeSlotTypeId: string;
      bookingDate: string;
      addonIds?: string[];
      safetyAcknowledged: boolean;
      notes?: string;
    }) => api.post<Booking>('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.patch<Booking>(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
