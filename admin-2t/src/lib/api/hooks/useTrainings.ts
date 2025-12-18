import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTrainings,
  getTodayTraining,
  getTrainingsByMonth,
  getTrainingsByDate,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  getTrainingsByActivity,
  getTrainingsByDateRange,
  type CreateTrainingDto,
  type UpdateTrainingDto,
  type GetTrainingsParams,
} from '@/lib/api/trainings';
import { useActiveAthleteActivities } from '@/lib/api/hooks/useActivities';
import type { Training } from '@/types/athlete';

// ============================================
// TRAINING QUERY HOOKS
// ============================================

/**
 * Hook para obtener todos los trainings con filtros opcionales
 */
export const useTrainings = (params?: GetTrainingsParams) => {
  return useQuery<Training[], Error>({
    queryKey: ['trainings', params],
    queryFn: () => getAllTrainings(params),
  });
};

/**
 * Hook para obtener el training de hoy
 */
export const useTodayTraining = () => {
  return useQuery<Training[], Error>({
    queryKey: ['trainings', 'today'],
    queryFn: getTodayTraining,
  });
};

/**
 * Hook para obtener trainings de un mes específico
 */
export const useTrainingsByMonth = (month: string) => {
  return useQuery<Training[], Error>({
    queryKey: ['trainings', 'month', month],
    queryFn: () => getTrainingsByMonth(month),
    enabled: !!month,
  });
};

/**
 * Hook para obtener trainings de una fecha específica
 */
export const useTrainingsByDate = (date: string) => {
  return useQuery<Training[], Error>({
    queryKey: ['trainings', 'date', date],
    queryFn: () => getTrainingsByDate(date),
    enabled: !!date,
  });
};

/**
 * Hook para obtener un training por ID
 */
export const useTraining = (id: string) => {
  return useQuery<Training, Error>({
    queryKey: ['trainings', id],
    queryFn: () => getTrainingById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener trainings por actividad
 */
export const useTrainingsByActivity = (activityId: string) => {
  return useQuery<Training[], Error>({
    queryKey: ['trainings', 'activity', activityId],
    queryFn: () => getTrainingsByActivity(activityId),
    enabled: !!activityId,
  });
};

/**
 * Hook para obtener trainings de un rango de fechas
 */
export const useTrainingsByDateRange = (startDate: string, endDate: string) => {
  return useQuery<Training[], Error>({
    queryKey: ['trainings', 'dateRange', startDate, endDate],
    queryFn: () => getTrainingsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

// ============================================
// TRAINING MUTATION HOOKS
// ============================================

/**
 * Hook para crear training
 */
export const useCreateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation<Training, Error, CreateTrainingDto>({
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

/**
 * Hook para actualizar training
 */
export const useUpdateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation<Training, Error, { id: string; data: UpdateTrainingDto }>({
    mutationFn: ({ id, data }) => updateTraining(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', data.id] });
    },
  });
};

/**
 * Hook para eliminar training
 */
export const useDeleteTraining = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

/**
 * Hook para obtener el training de hoy filtrado por actividades del atleta
 * Ahora confía en que el backend filtra correctamente y devuelve un array
 */
export const useAthleteTrainingToday = (athleteId: string | undefined) => {
  // Obtenemos todos los entrenamientos de hoy (backend devuelve un array)
  const { data: trainings = [], ...rest } = useTodayTraining();
  const { data: athleteActivities = [] } = useActiveAthleteActivities(athleteId || '');

  // Obtener IDs de actividades del atleta
  const athleteActivityIds = athleteActivities.map(aa => aa.activityId);

  // Filtrar según la lógica de visibilidad del atleta:
  // - Entrenamientos sin activityId (generales) siempre se muestran
  // - Si el atleta tiene actividades: mostrar entrenamientos de esas actividades + generales
  // - Si el atleta NO tiene actividades: mostrar solo entrenamientos sin actividad
  const filtered = trainings.filter(training => {
    if (!training.activityId) return true;
    if (athleteActivityIds.length === 0) return false;
    return athleteActivityIds.includes(training.activityId);
  });

  return {
    data: filtered,
    ...rest,
  };
};

/**
 * Hook para obtener trainings de un mes filtrados por actividades del atleta
 */
export const useAthleteTrainingsByMonth = (athleteId: string | undefined, month: string) => {
  const { data: athleteActivities = [] } = useActiveAthleteActivities(athleteId || '');
  const { data: trainings = [], ...rest } = useTrainingsByMonth(month);

  // Debug logs
  console.log('🔍 useAthleteTrainingsByMonth Debug:', {
    athleteId,
    athleteActivities,
    allTrainings: trainings,
    athleteActivityIds: athleteActivities.map(aa => aa.activityId),
  });

  // Obtener IDs de actividades del atleta
  const athleteActivityIds = athleteActivities.map(aa => aa.activityId);

  // Filtrar:
  // - Si el atleta NO tiene actividades asignadas → mostrar solo entrenamientos SIN actividad
  // - Si el atleta SÍ tiene actividades → mostrar entrenamientos de sus actividades O sin actividad
  const filteredTrainings = trainings.filter(training => {
    if (!training.activityId) {
      // Entrenamientos sin actividad = generales, siempre se muestran
      console.log('Training:', training.title, '(sin actividad) → shouldShow: true');
      return true;
    }
    
    if (athleteActivityIds.length === 0) {
      // Si el atleta no tiene actividades, no mostrar entrenamientos con actividad específica
      console.log('Training:', training.title, 'activityId:', training.activityId, '→ shouldShow: false (atleta sin actividades)');
      return false;
    }
    
    const shouldShow = athleteActivityIds.includes(training.activityId);
    console.log('Training:', training.title, 'activityId:', training.activityId, '→ shouldShow:', shouldShow);
    return shouldShow;
  });

  console.log('✅ Filtered trainings:', filteredTrainings);

  return {
    data: filteredTrainings,
    ...rest
  };
};
