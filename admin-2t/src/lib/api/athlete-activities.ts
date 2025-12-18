/**
 * SDK para el módulo de Actividades de Atletas
 */

import { apiClient } from './client';
import {
  AthleteActivity,
  CreateAthleteActivityDto,
  UpdateAthleteActivityNotesDto,
  ActivityStats,
} from '@/types/athlete';

/**
 * Cliente API para actividades de atletas
 */
export const athleteActivitiesApi = {
  /**
   * Obtener todas las actividades de un atleta (historial completo)
   */
  async getByAthlete(athleteId: string): Promise<AthleteActivity[]> {
    return apiClient.get<AthleteActivity[]>(
      `/athlete-activities/athlete/${athleteId}`,
      { revalidate: 30 }
    );
  },

  /**
   * Obtener solo actividades activas de un atleta
   */
  async getActiveByAthlete(athleteId: string): Promise<AthleteActivity[]> {
    return apiClient.get<AthleteActivity[]>(
      `/athlete-activities/athlete/${athleteId}/active`,
      { revalidate: 30 }
    );
  },

  /**
   * Obtener estadísticas de actividades
   */
  async getStats(): Promise<ActivityStats[]> {
    return apiClient.get<ActivityStats[]>('/athlete-activities/stats', {
      revalidate: 60,
    });
  },

  /**
   * Agregar una nueva actividad a un atleta
   */
  async create(data: CreateAthleteActivityDto): Promise<AthleteActivity> {
    return apiClient.post<AthleteActivity>('/athlete-activities', data);
  },

  /**
   * Finalizar una actividad (setear endDate y isActive=false)
   */
  async end(activityId: string): Promise<AthleteActivity> {
    return apiClient.patch<AthleteActivity>(
      `/athlete-activities/${activityId}/end`,
      {}
    );
  },

  /**
   * Reactivar una actividad finalizada
   */
  async reactivate(activityId: string): Promise<AthleteActivity> {
    return apiClient.patch<AthleteActivity>(
      `/athlete-activities/${activityId}/reactivate`,
      {}
    );
  },

  /**
   * Actualizar notas de una actividad
   */
  async updateNotes(
    activityId: string,
    data: UpdateAthleteActivityNotesDto
  ): Promise<AthleteActivity> {
    return apiClient.patch<AthleteActivity>(
      `/athlete-activities/${activityId}/notes`,
      data
    );
  },

  /**
   * Eliminar una actividad
   */
  async delete(activityId: string): Promise<void> {
    return apiClient.delete(`/athlete-activities/${activityId}`);
  },
};
