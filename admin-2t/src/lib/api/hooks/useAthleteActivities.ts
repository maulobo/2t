/**
 * React Query hooks para Actividades de Atletas
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { athleteActivitiesApi } from '../athlete-activities';
import {
  CreateAthleteActivityDto,
  UpdateAthleteActivityNotesDto,
} from '@/types/athlete';

/**
 * Keys para caché de React Query
 */
export const athleteActivitiesKeys = {
  all: ['athlete-activities'] as const,
  lists: () => [...athleteActivitiesKeys.all, 'list'] as const,
  byAthlete: (athleteId: string) =>
    [...athleteActivitiesKeys.lists(), athleteId] as const,
  activeByAthlete: (athleteId: string) =>
    [...athleteActivitiesKeys.lists(), athleteId, 'active'] as const,
  stats: () => [...athleteActivitiesKeys.all, 'stats'] as const,
};

/**
 * Hook para obtener todas las actividades de un atleta
 */
export function useAthleteActivities(athleteId: string, enabled = true) {
  return useQuery({
    queryKey: athleteActivitiesKeys.byAthlete(athleteId),
    queryFn: () => athleteActivitiesApi.getByAthlete(athleteId),
    enabled: enabled && !!athleteId,
  });
}

/**
 * Hook para obtener solo actividades activas de un atleta
 */
export function useActiveAthleteActivities(athleteId: string, enabled = true) {
  return useQuery({
    queryKey: athleteActivitiesKeys.activeByAthlete(athleteId),
    queryFn: () => athleteActivitiesApi.getActiveByAthlete(athleteId),
    enabled: enabled && !!athleteId,
  });
}

/**
 * Hook para obtener estadísticas de actividades
 */
export function useActivityStats() {
  return useQuery({
    queryKey: athleteActivitiesKeys.stats(),
    queryFn: () => athleteActivitiesApi.getStats(),
  });
}

/**
 * Hook para agregar una actividad
 */
export function useCreateAthleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAthleteActivityDto) =>
      athleteActivitiesApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidar actividades del atleta
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.byAthlete(variables.athleteId),
      });
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.activeByAthlete(variables.athleteId),
      });
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.stats(),
      });
    },
  });
}

/**
 * Hook para finalizar una actividad
 */
export function useEndAthleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => athleteActivitiesApi.end(activityId),
    onSuccess: () => {
      // Invalidar todas las queries de actividades
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.all,
      });
    },
  });
}

/**
 * Hook para reactivar una actividad
 */
export function useReactivateAthleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      athleteActivitiesApi.reactivate(activityId),
    onSuccess: () => {
      // Invalidar todas las queries de actividades
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.all,
      });
    },
  });
}

/**
 * Hook para actualizar notas
 */
export function useUpdateAthleteActivityNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      data,
    }: {
      activityId: string;
      data: UpdateAthleteActivityNotesDto;
    }) => athleteActivitiesApi.updateNotes(activityId, data),
    onSuccess: () => {
      // Invalidar todas las queries de actividades
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.all,
      });
    },
  });
}

/**
 * Hook para eliminar una actividad
 */
export function useDeleteAthleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      athleteActivitiesApi.delete(activityId),
    onSuccess: () => {
      // Invalidar todas las queries de actividades
      queryClient.invalidateQueries({
        queryKey: athleteActivitiesKeys.all,
      });
    },
  });
}
