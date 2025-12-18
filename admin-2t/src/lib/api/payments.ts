/**
 * SDK para el módulo de Pagos
 */

import { apiClient } from './client';
import { Payment } from '@/types/athlete';

export interface CreatePaymentDto {
  athleteId: string;
  amount: number;          // en pesos (ej: 50.00) — el backend puede almacenar en centavos internamente
  periodStart: string;     // ISO date
  periodEnd: string;       // ISO date
  evidenceUrl?: string;    // opcional
  evidenceText?: string;   // opcional
  activityId?: string;     // ID de la actividad pagada
  // Nuevos campos para pagos por cantidad/unidad
  quantity?: number;       // Cantidad de unidades (ej: 3 horas). Default: 1
  pricePerUnit?: number;   // Precio unitario (ej: 10000 por hora)
  activityType?: string;   // Tipo de actividad pagada (ej: "HORA_A", "CROSSFIT") - DEPRECATED, usar activityId
}

export interface PaymentListParams {
  coachId?: string;
  athleteId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/**
 * Cliente API para el módulo de Pagos
 */
export const paymentsApi = {
  /**
   * Crear un nuevo pago
   * USO: Client Component o Server Action
   */
  async create(data: CreatePaymentDto): Promise<Payment> {
    return apiClient.post<Payment>('/payments', data);
  },

  /**
   * Obtener pagos de un atleta
   * USO: Server Component o Client Component
   */
  async getByAthlete(athleteId: string): Promise<Payment[]> {
    // Incluir la relación 'activity' para mostrar el nombre y color de la actividad
    return apiClient.get<Payment[]>(`/payments/athlete/${athleteId}?include=activity`, {
      revalidate: 30,
    });
  },

  /**
   * Obtener pagos pendientes
   * USO: Server Component o Client Component
   */
  async getPending(coachId?: string): Promise<Payment[]> {
    // Construir query params incluyendo 'activity'
    const params: Record<string, string> = { include: 'activity' };
    if (coachId) {
      params.coachId = coachId;
    }
    
    const queryString = apiClient.buildQueryString(params);
    
    return apiClient.get<Payment[]>(
      `/payments/pending${queryString}`,
      {
        revalidate: 10, // Revalidar cada 10 segundos (datos más frescos)
      }
    );
  },

  /**
   * Aprobar un pago
   * USO: Client Component o Server Action
   */
  async approve(paymentId: string): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${paymentId}/approve`);
  },

  /**
   * Rechazar un pago
   * USO: Client Component o Server Action
   */
  async reject(paymentId: string): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${paymentId}/reject`);
  },
};
