import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Project, Snapshot } from '@/types';

export function useWorkshopSnapshots(workshopId: string) {
  return useQuery({
    queryKey: ['projects', 'workshop', workshopId],
    queryFn: () => api.get<Project[]>(`/snapshots/workshop/${workshopId}`),
    enabled: !!workshopId,
  });
}

export function useUserProjects(userId: string) {
  return useQuery({
    queryKey: ['projects', 'user', userId],
    queryFn: () => api.get<Project[]>(`/snapshots/user/${userId}`),
    enabled: !!userId,
  });
}

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get<Project>(`/snapshots/projects/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; title: string; description?: string }) =>
      api.post<Project>('/snapshots/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      ...data
    }: {
      projectId: string;
      beforePhotoUrl: string;
      afterPhotoUrl: string;
      notes?: string;
      toolIds?: string[];
      skillIds?: string[];
    }) => api.post<Snapshot>(`/snapshots/projects/${projectId}/snapshots`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
