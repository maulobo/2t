/**
 * SDK para el módulo de Cuotas/Fees
 */

import { apiClient } from './client';
import { Fee, CreateFeeDto, UpdateFeeDto, FeeListParams, CurrentFee } from '@/types/fee';

/**
 * Cliente API para el módulo de Cuotas
 */
export const feesApi = {
  /**
   * Obtener todas las cuotas
   */
  async getAll(params?: FeeListParams): Promise<Fee[]> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<Fee[]>(`/fees${queryString}`, {
      revalidate: 60, // Cache por 1 minuto
    });
  },

  /**
   * Obtener cuota actual vigente
   */
  async getCurrent(activityType?: string, coachId?: string): Promise<CurrentFee | null> {
    const params: Record<string, string> = {};
    if (activityType) params.activityType = activityType;
    if (coachId) params.coachId = coachId;
    
    const queryString = Object.keys(params).length > 0
      ? apiClient.buildQueryString(params)
      : '';
    
    return apiClient.get<CurrentFee | null>(
      `/fees/current${queryString}`,
      {
        revalidate: 30, // Cache por 30 segundos
      }
    );
  },

  /**
   * Obtener una cuota específica por ID
   */
  async getById(feeId: string): Promise<Fee> {
    return apiClient.get<Fee>(`/fees/${feeId}`, {
      revalidate: 60,
    });
  },

  /**
   * Crear una nueva cuota
   */
  async create(data: CreateFeeDto): Promise<Fee> {
    return apiClient.post<Fee>('/fees', data);
  },

  /**
   * Actualizar una cuota existente
   */
  async update(feeId: string, data: UpdateFeeDto): Promise<Fee> {
    return apiClient.patch<Fee>(`/fees/${feeId}`, data);
  },

  /**
   * Eliminar una cuota (solo si no está siendo usada)
   */
  async delete(feeId: string): Promise<void> {
    return apiClient.delete(`/fees/${feeId}`);
  },

  /**
   * Desactivar cuota actual y activar una nueva
   */
  async setActive(feeId: string): Promise<Fee> {
    return apiClient.patch<Fee>(`/fees/${feeId}/activate`);
  },
};