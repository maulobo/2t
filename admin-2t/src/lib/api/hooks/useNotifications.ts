import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../notifications";

/**
 * Keys para el cache de React Query
 */
export const notificationsKeys = {
  all: ['notifications'] as const,
  expiring: (days?: number) => [...notificationsKeys.all, 'expiring', days] as const,
  expired: () => [...notificationsKeys.all, 'expired'] as const,
};

/**
 * Hook para obtener pagos próximos a vencer
 */
export function useExpiringPayments(days: number = 3, enabled: boolean = true) {
  return useQuery({
    queryKey: notificationsKeys.expiring(days),
    queryFn: () => notificationsApi.checkExpiring(days),
    enabled,
    // Refrescar cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
    // Mantener datos en cache por 10 minutos
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener pagos vencidos
 */
export function useExpiredPayments(enabled: boolean = true) {
  return useQuery({
    queryKey: notificationsKeys.expired(),
    queryFn: () => notificationsApi.checkExpired(),
    enabled,
    // Refrescar cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para forzar verificación manual de pagos próximos a vencer
 */
export function useForceCheckExpiring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days: number = 3) => notificationsApi.forceCheck(days),
    onSuccess: (data, days) => {
      // Invalidar cache de pagos próximos a vencer
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.expiring(days),
      });
      // También invalidar cache de atletas (para refrescar el widget)
      queryClient.invalidateQueries({
        queryKey: ['athletes'],
      });
    },
  });
}
