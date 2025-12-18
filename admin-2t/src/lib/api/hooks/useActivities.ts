import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllActivities,
  getActiveActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deactivateActivity,
  deleteActivity,
  assignActivityToAthlete,
  getAthleteActivities,
  getActiveAthleteActivities,
  updateAthleteActivity,
  unassignActivityFromAthlete,
  deleteAthleteActivity,
  getActivityAthletes,
  type CreateActivityDto,
  type UpdateActivityDto,
  type AssignActivityDto,
  type UpdateAthleteActivityDto,
} from '@/lib/api/activities';
import type { Activity, AthleteActivity } from '@/types/athlete';

// ============================================
// ACTIVITY CATALOG HOOKS
// ============================================

/**
 * Hook para obtener todas las actividades
 */
export const useActivities = () => {
  return useQuery<Activity[], Error>({
    queryKey: ['activities'],
    queryFn: getAllActivities,
  });
};

/**
 * Hook para obtener solo actividades activas
 */
export const useActiveActivities = () => {
  return useQuery<Activity[], Error>({
    queryKey: ['activities', 'active'],
    queryFn: getActiveActivities,
  });
};

/**
 * Hook para obtener una actividad por ID
 */
export const useActivity = (id: string) => {
  return useQuery<Activity, Error>({
    queryKey: ['activities', id],
    queryFn: () => getActivityById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear actividad
 */
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<Activity, Error, CreateActivityDto>({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

/**
 * Hook para actualizar actividad
 */
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<Activity, Error, { id: string; data: UpdateActivityDto }>({
    mutationFn: ({ id, data }) => updateActivity(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', data.id] });
    },
  });
};

/**
 * Hook para desactivar actividad
 */
export const useDeactivateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<Activity, Error, string>({
    mutationFn: deactivateActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

/**
 * Hook para eliminar actividad
 */
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

// ============================================
// ATHLETE ACTIVITY HOOKS (Many-to-Many)
// ============================================

/**
 * Hook para obtener actividades de un atleta
 */
export const useAthleteActivities = (athleteId: string) => {
  return useQuery<AthleteActivity[], Error>({
    queryKey: ['athlete-activities', athleteId],
    queryFn: () => getAthleteActivities(athleteId),
    enabled: !!athleteId,
  });
};

/**
 * Hook para obtener solo actividades activas de un atleta
 */
export const useActiveAthleteActivities = (athleteId: string) => {
  return useQuery<AthleteActivity[], Error>({
    queryKey: ['athlete-activities', athleteId, 'active'],
    queryFn: () => getActiveAthleteActivities(athleteId),
    enabled: !!athleteId,
  });
};

/**
 * Hook para asignar actividad a atleta
 */
export const useAssignActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<AthleteActivity, Error, AssignActivityDto>({
    mutationFn: assignActivityToAthlete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['athlete-activities', data.athleteId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activity-athletes', data.activityId],
      });
    },
  });
};

/**
 * Hook para actualizar relación atleta-actividad
 */
export const useUpdateAthleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AthleteActivity,
    Error,
    { id: string; data: UpdateAthleteActivityDto }
  >({
    mutationFn: ({ id, data }) => updateAthleteActivity(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['athlete-activities', data.athleteId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activity-athletes', data.activityId],
      });
    },
  });
};

/**
 * Hook para desasignar/finalizar actividad de atleta
 */
export const useUnassignActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: unassignActivityFromAthlete,
    onSuccess: () => {
      // Invalidar todas las queries de athlete-activities
      queryClient.invalidateQueries({
        queryKey: ['athlete-activities'],
      });
      queryClient.invalidateQueries({
        queryKey: ['activity-athletes'],
      });
    },
  });
};

/**
 * Hook para eliminar completamente una relación atleta-actividad
 */
export const useDeleteAthleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; athleteId: string }>({
    mutationFn: ({ id }) => deleteAthleteActivity(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['athlete-activities', variables.athleteId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activity-athletes'],
      });
    },
  });
};

/**
 * Hook para obtener atletas asignados a una actividad
 */
export const useActivityAthletes = (activityId: string) => {
  return useQuery<AthleteActivity[], Error>({
    queryKey: ['activity-athletes', activityId],
    queryFn: () => getActivityAthletes(activityId),
    enabled: !!activityId,
  });
};
