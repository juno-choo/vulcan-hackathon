import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Workshop } from '@/types';

interface WorkshopSearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  equipment?: string[];
  category?: string;
}

export function useWorkshops(params: WorkshopSearchParams = {}) {
  const queryString = new URLSearchParams();
  if (params.lat != null) queryString.set('lat', String(params.lat));
  if (params.lng != null) queryString.set('lng', String(params.lng));
  if (params.radius) queryString.set('radius', String(params.radius));
  if (params.equipment?.length) queryString.set('equipment', params.equipment.join(','));
  if (params.category) queryString.set('category', params.category);

  return useQuery({
    queryKey: ['workshops', params],
    queryFn: () => api.get<Workshop[]>(`/workshops?${queryString.toString()}`),
  });
}

export function useWorkshopDetail(id: string) {
  return useQuery({
    queryKey: ['workshop', id],
    queryFn: () => api.get<Workshop>(`/workshops/${id}`),
    enabled: !!id,
  });
}
