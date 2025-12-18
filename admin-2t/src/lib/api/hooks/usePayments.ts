/**
 * React Query hooks para Pagos
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, CreatePaymentDto } from '../payments';

/**
 * Keys para caché de React Query
 */
export const paymentsKeys = {
  all: ['payments'] as const,
  byAthlete: (athleteId: string) => [...paymentsKeys.all, 'athlete', athleteId] as const,
  pending: (coachId?: string) => [...paymentsKeys.all, 'pending', coachId] as const,
};

/**
 * Hook para obtener pagos de un atleta
 */
export function useAthletePayments(athleteId: string, enabled = true) {
  return useQuery({
    queryKey: paymentsKeys.byAthlete(athleteId),
    queryFn: () => paymentsApi.getByAthlete(athleteId),
    enabled,
  });
}

/**
 * Hook para obtener pagos pendientes
 */
export function usePendingPayments(coachId?: string) {
  return useQuery({
    queryKey: paymentsKeys.pending(coachId),
    queryFn: () => paymentsApi.getPending(coachId),
    refetchInterval: 30000, // Refetch cada 30 segundos
  });
}

/**
 * Hook para crear un pago
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentsApi.create(data),
    onSuccess: (newPayment) => {
      // Invalidar pagos del atleta
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.byAthlete(newPayment.athleteId),
      });

      // Invalidar lista de atletas (para actualizar badge de estado de pago)
      queryClient.invalidateQueries({
        queryKey: ['athletes'],
      });

      // Si está pendiente, invalidar lista de pendientes
      if (newPayment.status === 'PENDING') {
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.pending(),
        });
      }
    },
  });
}

/**
 * Hook para aprobar un pago
 */
export function useApprovePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.approve(paymentId),
    onSuccess: (approvedPayment) => {
      // Invalidar pagos del atleta
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.byAthlete(approvedPayment.athleteId),
      });

      // Invalidar lista de pendientes
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.pending(),
      });

      // Invalidar lista de atletas
      queryClient.invalidateQueries({
        queryKey: ['athletes'],
      });
    },
  });
}

/**
 * Hook para rechazar un pago
 */
export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.reject(paymentId),
    onSuccess: (rejectedPayment) => {
      // Invalidar pagos del atleta
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.byAthlete(rejectedPayment.athleteId),
      });

      // Invalidar lista de pendientes
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.pending(),
      });

      // Invalidar lista de atletas
      queryClient.invalidateQueries({
        queryKey: ['athletes'],
      });
    },
  });
}
