/**
 * Tipos para el sistema de gestión de cuotas
 */

/**
 * Configuración de cuota mensual
 */
export interface Fee {
  id: string;
  amount: string | number; // Backend envía como string, necesitamos parsearlo
  currency: string; // "ARS", "USD", etc.
  activityType: string; // "PERSONALIZADO_A", "OPEN_BOX", "FUNCIONAL", etc.
  activityName: string; // Nombre para mostrar: "Personalizado A", "Open Box"
  validFrom: string; // ISO date
  validUntil: string | null; // ISO date, null = vigente hasta nueva cuota
  isActive: boolean;
  description?: string | null; // Ej: "Cuota base", "Incremento por inflación"
  createdAt: string;
  updatedAt: string;
  coachId?: string | null; // Opcional, por si cada coach maneja sus cuotas
  coach?: { id: string; email: string; role: string } | null; // Relación con coach
}

/**
 * DTO para crear una nueva cuota
 */
export interface CreateFeeDto {
  amount: number;
  currency?: string; // Default: "ARS"
  activityType: string; // Requerido: tipo de actividad
  activityName: string; // Requerido: nombre de la actividad
  validFrom: string;
  validUntil?: string; // Opcional
  description?: string;
  coachId?: string;
}

/**
 * DTO para actualizar una cuota existente
 */
export interface UpdateFeeDto {
  amount?: number;
  validUntil?: string; // Para "cerrar" una cuota vigente
  description?: string;
  isActive?: boolean;
}

/**
 * Parámetros para listar cuotas
 */
export interface FeeListParams {
  coachId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Respuesta de la lista de cuotas
 */
export interface FeeListResponse {
  fees: Fee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Cuota actual vigente (para usar en formularios)
 */
export interface CurrentFee {
  id: string;
  amount: number;
  currency: string;
  activityType: string;
  activityName: string;
  validFrom: string;
}

/**
 * Tipos de actividades disponibles
 * 
 * MEMBRESÍAS (pago mensual fijo):
 * - PERSONALIZADO_A, PERSONALIZADO_B, OPEN_BOX, FUNCIONAL, CROSSFIT
 * 
 * HORAS INDIVIDUALES (pago por cantidad):
 * - HORA_A, HORA_B, HORA_C
 */
export const ACTIVITY_TYPES = {
  PERSONALIZADO_A: { code: 'PERSONALIZADO_A', name: 'Personalizado A', isSubscription: true },
  PERSONALIZADO_B: { code: 'PERSONALIZADO_B', name: 'Personalizado B', isSubscription: true },
  OPEN_BOX: { code: 'OPEN_BOX', name: 'Open Box', isSubscription: true },
  FUNCIONAL: { code: 'FUNCIONAL', name: 'Funcional', isSubscription: true },
  CROSSFIT: { code: 'CROSSFIT', name: 'CrossFit', isSubscription: true },
} as const;

export type ActivityTypeCode = keyof typeof ACTIVITY_TYPES;