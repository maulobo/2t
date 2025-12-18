import api from '@/lib/axios';
import { Training } from '@/types/athlete';

/**
 * SDK para gestión de Trainings (Renombrado de WODs)
 * Endpoints: /trainings/*
 */

// ============================================
// TYPES
// ============================================

export interface CreateTrainingDto {
  title: string;
  description: string;
  date: string; // ISO date string
  videoUrl?: string | null; // URL de YouTube/Vimeo
  activityId?: string | null; // A qué actividad pertenece
  createdById: string; // Usuario que crea el entrenamiento (requerido)
}

export interface UpdateTrainingDto {
  title?: string;
  description?: string;
  date?: string;
  videoUrl?: string | null;
  activityId?: string | null;
}

export interface GetTrainingsParams {
  date?: string; // Fecha específica (YYYY-MM-DD)
  startDate?: string; // Rango de fechas inicio
  endDate?: string; // Rango de fechas fin
  activityId?: string; // Filtrar por actividad
  month?: string; // Mes específico (YYYY-MM)
}

// ============================================
// TRAINING CRUD
// ============================================

/**
 * Obtener todos los trainings con filtros opcionales
 */
export const getAllTrainings = async (params?: GetTrainingsParams): Promise<Training[]> => {
  const response = await api.get('/trainings', { params });
  const data = response.data;
  
  // Validar que sea un array
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si es un objeto con una propiedad que contiene el array
  if (data && typeof data === 'object') {
    // Intentar encontrar el array en propiedades comunes
    if (Array.isArray(data.trainings)) {
      console.log('[SDK Trainings] Response wrapped in .trainings property');
      return data.trainings;
    }
    if (Array.isArray(data.data)) {
      console.log('[SDK Trainings] Response wrapped in .data property');
      return data.data;
    }
    if (Array.isArray(data.items)) {
      console.log('[SDK Trainings] Response wrapped in .items property');
      return data.items;
    }
  }
  
  console.warn('[SDK Trainings] Unexpected response format:', data);
  return [];
};

/**
 * Obtener training de hoy
 */
export const getTodayTraining = async (): Promise<Training[]> => {
  const response = await api.get('/trainings/today');
  const data = response.data;
  
  // El backend puede devolver diferentes formatos:
  // 1. { date, trainings: [...] } - array de trainings
  // 2. Training - directamente el training
  // 3. null - no hay training
  
  if (!data) return [];
  
  // Si es un array directo
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si tiene la propiedad 'trainings', es el formato con array
  if (data.trainings && Array.isArray(data.trainings)) {
    return data.trainings;
  }
  
  // Si tiene 'id', es un training directo
  if (data.id) {
    return [data];
  }
  
  return [];
};

/**
 * Obtener trainings de un mes específico
 * Formato del mes: "YYYY-MM"
 */
export const getTrainingsByMonth = async (month: string): Promise<Training[]> => {
  // Parsear el mes para obtener el rango de fechas
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // Último día del mes
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log('[SDK getTrainingsByMonth] Fetching:', { month, startDateStr, endDateStr });
  
  const result = await getAllTrainings({ 
    startDate: startDateStr, 
    endDate: endDateStr 
  });
  
  console.log('[SDK getTrainingsByMonth] Result:', { count: result?.length, isArray: Array.isArray(result) });
  
  return result;
};

/**
 * Obtener trainings de una fecha específica
 */
export const getTrainingsByDate = async (date: string): Promise<Training[]> => {
  const response = await api.get('/trainings/date', {
    params: { date },
  });
  return response.data;
};

/**
 * Obtener training por ID
 */
export const getTrainingById = async (id: string): Promise<Training> => {
  const response = await api.get(`/trainings/${id}`);
  return response.data;
};

/**
 * Crear nuevo training
 */
export const createTraining = async (data: CreateTrainingDto): Promise<Training> => {
  const response = await api.post('/trainings', data);
  return response.data;
};

/**
 * Actualizar training
 */
export const updateTraining = async (
  id: string,
  data: UpdateTrainingDto
): Promise<Training> => {
  const response = await api.put(`/trainings/${id}`, data);
  return response.data;
};

/**
 * Eliminar training
 */
export const deleteTraining = async (id: string): Promise<void> => {
  await api.delete(`/trainings/${id}`);
};

// ============================================
// TRAINING FILTERS
// ============================================

/**
 * Obtener trainings por actividad
 */
export const getTrainingsByActivity = async (activityId: string): Promise<Training[]> => {
  return getAllTrainings({ activityId });
};

/**
 * Obtener trainings de un rango de fechas
 */
export const getTrainingsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Training[]> => {
  return getAllTrainings({ startDate, endDate });
};
