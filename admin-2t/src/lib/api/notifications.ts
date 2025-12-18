/**
 * SDK para el módulo de Notificaciones
 */

import { apiClient } from './client';

export interface ExpiringPaymentNotification {
  sent: boolean;
  athleteId: string;
  athleteName: string;
  email: string;
  phone: string | null;
  expirationDate: string;
  amount: number;
  quantity?: number;
  pricePerUnit?: number;
  activityType?: string;
  message: string;
}

export interface CheckExpiringResponse {
  found: number;
  notifications: ExpiringPaymentNotification[];
  targetDate: string;
}

export interface CheckExpiredResponse {
  found: number;
  notifications: ExpiringPaymentNotification[];
}

/**
 * Cliente API para el módulo de Notificaciones
 */
export const notificationsApi = {
  /**
   * Verificar pagos próximos a vencer
   * @param days - Días de anticipación (default: 3)
   */
  async checkExpiring(days: number = 3): Promise<CheckExpiringResponse> {
    return apiClient.get<CheckExpiringResponse>(
      `/notifications/check-expiring?days=${days}`
    );
  },

  /**
   * Verificar pagos vencidos
   */
  async checkExpired(): Promise<CheckExpiredResponse> {
    return apiClient.get<CheckExpiredResponse>('/notifications/check-expired');
  },

  /**
   * Forzar verificación manual de pagos próximos a vencer
   * (Útil para testing o ejecutar manualmente)
   */
  async forceCheck(days: number = 3): Promise<CheckExpiringResponse> {
    return apiClient.post<CheckExpiringResponse>(
      `/notifications/check-expiring`,
      { days }
    );
  },
};
