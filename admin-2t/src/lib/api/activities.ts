import axios from 'axios';
import { Activity, AthleteActivity } from '@/types/athlete';

/**
 * SDK para gestión de Activities (Catálogo de actividades del box)
 * Endpoints: /activities/*
 */

// ============================================
// TYPES
// ============================================

export interface CreateActivityDto {
  name: string;
  description: string;
  price: number;
  color?: string;
  icon?: string;
}

export interface UpdateActivityDto {
  name?: string;
  description?: string;
  price?: number;
  color?: string;
  icon?: string;
  active?: boolean;
}

export interface AssignActivityDto {
  athleteId: string;
  activityId: string;
  startDate: string; // ISO date string
  endDate?: string | null;
  notes?: string;
}

export interface UpdateAthleteActivityDto {
  endDate?: string | null;
  isActive?: boolean;
  notes?: string;
}

// ============================================
// ACTIVITY CATALOG CRUD
// ============================================

/**
 * Obtener todas las actividades
 */
export const getAllActivities = async (): Promise<Activity[]> => {
  const response = await axios.get('/api/activities');
  return response.data;
};

/**
 * Obtener todas las actividades activas
 */
export const getActiveActivities = async (): Promise<Activity[]> => {
  const response = await axios.get('/api/activities?active=true');
  return response.data;
};

/**
 * Obtener actividad por ID
 */
export const getActivityById = async (id: string): Promise<Activity> => {
  const response = await axios.get(`/api/activities/${id}`);
  return response.data;
};

/**
 * Crear nueva actividad
 */
export const createActivity = async (data: CreateActivityDto): Promise<Activity> => {
  const response = await axios.post('/api/activities', data);
  return response.data;
};

/**
 * Actualizar actividad
 */
export const updateActivity = async (
  id: string,
  data: UpdateActivityDto
): Promise<Activity> => {
  const response = await axios.put(`/api/activities/${id}`, data);
  return response.data;
};

/**
 * Desactivar actividad (soft delete)
 */
export const deactivateActivity = async (id: string): Promise<Activity> => {
  const response = await axios.put(`/api/activities/${id}`, { active: false });
  return response.data;
};

/**
 * Eliminar actividad (hard delete)
 */
export const deleteActivity = async (id: string): Promise<void> => {
  await axios.delete(`/api/activities/${id}`);
};

// ============================================
// ATHLETE ACTIVITY MANAGEMENT (Many-to-Many)
// ============================================

/**
 * Asignar actividad a un atleta
 */
export const assignActivityToAthlete = async (
  data: AssignActivityDto
): Promise<AthleteActivity> => {
  const response = await axios.post('/api/activities/assign', data);
  return response.data;
};

/**
 * Obtener todas las actividades de un atleta
 */
export const getAthleteActivities = async (
  athleteId: string
): Promise<AthleteActivity[]> => {
  const response = await axios.get(`/api/activities/athletes/${athleteId}/activities`);
  return response.data;
};

/**
 * Obtener solo actividades activas de un atleta
 */
export const getActiveAthleteActivities = async (
  athleteId: string
): Promise<AthleteActivity[]> => {
  console.log('🔍 getActiveAthleteActivities called with athleteId:', athleteId);
  const response = await axios.get(`/api/activities/athletes/${athleteId}/activities?active=true`);
  console.log('🔍 getActiveAthleteActivities response:', response.data);
  return response.data;
};

/**
 * Actualizar relación atleta-actividad (reactivar o modificar fechas)
 */
export const updateAthleteActivity = async (
  id: string,
  data: UpdateAthleteActivityDto
): Promise<AthleteActivity> => {
  const response = await axios.put(`/api/activities/assignments/${id}`, data);
  return response.data;
};

/**
 * Desasignar/Finalizar actividad de un atleta (usando DELETE según backend)
 */
export const unassignActivityFromAthlete = async (
  id: string
): Promise<void> => {
  await axios.delete(`/api/activities/assignments/${id}`);
};

/**
 * Eliminar completamente relación atleta-actividad (alias de unassign)
 */
export const deleteAthleteActivity = async (
  id: string
): Promise<void> => {
  await axios.delete(`/api/activities/assignments/${id}`);
};

/**
 * Obtener atletas asignados a una actividad
 */
export const getActivityAthletes = async (
  activityId: string
): Promise<AthleteActivity[]> => {
  const response = await axios.get(`/api/activities/${activityId}/athletes`);
  return response.data;
};
