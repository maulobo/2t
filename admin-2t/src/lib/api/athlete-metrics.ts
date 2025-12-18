/**
 * API cliente para métricas de atletas
 */

import { apiClient } from './client';
import type {
  AthleteMetric,
  CreateAthleteMetricDto,
  UpdateAthleteMetricDto,
  WeightProgressResponse,
  PersonalRecordsResponse,
  BenchmarkRecordsResponse,
} from '@/types/athlete';

export const athleteMetricsApi = {
  /**
   * Crear una nueva medición/métrica
   */
  async create(data: CreateAthleteMetricDto): Promise<AthleteMetric> {
    return apiClient.post<AthleteMetric>('/athlete-metrics', data);
  },

  /**
   * Obtener historial de métricas de un atleta
   */
  async getHistory(athleteId: string): Promise<AthleteMetric[]> {
    return apiClient.get<AthleteMetric[]>(`/athlete-metrics/athlete/${athleteId}`);
  },

  /**
   * Obtener la última medición de un atleta
   */
  async getLatest(athleteId: string): Promise<AthleteMetric | null> {
    return apiClient.get<AthleteMetric | null>(`/athlete-metrics/athlete/${athleteId}/latest`);
  },

  /**
   * Obtener progreso de peso
   */
  async getWeightProgress(athleteId: string): Promise<WeightProgressResponse> {
    return apiClient.get<WeightProgressResponse>(`/athlete-metrics/athlete/${athleteId}/weight-progress`);
  },

  /**
   * Obtener récords personales (1RM)
   */
  async getPersonalRecords(athleteId: string): Promise<PersonalRecordsResponse> {
    return apiClient.get<PersonalRecordsResponse>(`/athlete-metrics/athlete/${athleteId}/personal-records`);
  },

  /**
   * Obtener récords de benchmarks
   */
  async getBenchmarkRecords(athleteId: string): Promise<BenchmarkRecordsResponse> {
    return apiClient.get<BenchmarkRecordsResponse>(`/athlete-metrics/athlete/${athleteId}/benchmark-records`);
  },

  /**
   * Actualizar una métrica
   */
  async update(id: string, data: UpdateAthleteMetricDto): Promise<AthleteMetric> {
    return apiClient.patch<AthleteMetric>(`/athlete-metrics/${id}`, data);
  },

  /**
   * Eliminar una métrica
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/athlete-metrics/${id}`);
  },
};
