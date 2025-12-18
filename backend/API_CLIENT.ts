/**
 * API Client - Ready to use functions for frontend
 * Copiar este archivo en tu proyecto: lib/api/
 */

// ============================================
// CONFIGURATION
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================
// BASE FETCH WRAPPER
// ============================================

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new APIError(
      response.status,
      error.message || 'Request failed',
      error,
    );
  }

  return response.json();
}

// ============================================
// COACHES
// ============================================

export const coachesAPI = {
  /**
   * Crear un nuevo coach
   */
  create: (data: { email: string; password: string; phone?: string }) => {
    return fetchAPI('/users/coach', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Listar todos los coaches
   */
  list: () => {
    return fetchAPI('/users/coaches');
  },
};

// ============================================
// ATHLETES
// ============================================

export const athletesAPI = {
  /**
   * Crear un nuevo atleta
   */
  create: (data: {
    email: string;
    password: string;
    phone?: string;
    fullName: string;
    birthDate?: string;
    coachId: string;
    notes?: string;
  }) => {
    return fetchAPI('/athletes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Listar atletas de un coach
   */
  listByCoach: (coachId: string) => {
    return fetchAPI(`/athletes/coach/${coachId}`);
  },

  /**
   * Obtener detalle de un atleta
   */
  get: (athleteId: string) => {
    return fetchAPI(`/athletes/${athleteId}`);
  },

  /**
   * Actualizar un atleta
   */
  update: (
    athleteId: string,
    data: {
      fullName?: string;
      birthDate?: string;
      notes?: string;
      active?: boolean;
    },
  ) => {
    return fetchAPI(`/athletes/${athleteId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verificar estado de pago de un atleta
   */
  getPaymentStatus: (athleteId: string) => {
    return fetchAPI<{ isPaid: boolean; payment: any | null }>(
      `/athletes/${athleteId}/payment-status`,
    );
  },
};

// ============================================
// PAYMENTS
// ============================================

export const paymentsAPI = {
  /**
   * Crear un nuevo pago
   */
  create: (data: {
    athleteId: string;
    amount: number; // en pesos
    periodStart: string;
    periodEnd: string;
    evidenceUrl?: string;
    evidenceText?: string;
  }) => {
    return fetchAPI('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Listar pagos pendientes
   */
  listPending: (coachId?: string) => {
    const query = coachId ? `?coachId=${coachId}` : '';
    return fetchAPI(`/payments/pending${query}`);
  },

  /**
   * Listar pagos de un atleta
   */
  listByAthlete: (athleteId: string) => {
    return fetchAPI(`/payments/athlete/${athleteId}`);
  },

  /**
   * Aprobar un pago
   */
  approve: (paymentId: string) => {
    return fetchAPI(`/payments/${paymentId}/approve`, {
      method: 'PATCH',
    });
  },

  /**
   * Rechazar un pago
   */
  reject: (paymentId: string) => {
    return fetchAPI(`/payments/${paymentId}/reject`, {
      method: 'PATCH',
    });
  },

  /**
   * Actualizar evidencia de un pago
   */
  updateEvidence: (
    paymentId: string,
    data: {
      evidenceUrl: string;
      evidenceText?: string;
    },
  ) => {
    return fetchAPI(`/payments/${paymentId}/evidence`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// HELPERS
// ============================================

/**
 * Convertir centavos a pesos
 */
export function centsToPesos(cents: number): number {
  return cents / 100;
}

/**
 * Convertir pesos a centavos
 */
export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

/**
 * Formatear monto en pesos
 */
export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(centsToPesos(cents));
}

/**
 * Formatear fecha
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-AR');
}

/**
 * Obtener periodo del mes actual
 */
export function getCurrentMonthPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Verificar si un pago cubre la fecha actual
 */
export function isPaymentActive(payment: {
  periodStart: string;
  periodEnd: string;
  status: string;
}): boolean {
  const now = new Date();
  const start = new Date(payment.periodStart);
  const end = new Date(payment.periodEnd);

  return payment.status === 'APPROVED' && now >= start && now <= end;
}
