/**
 * React Query hooks para Cuotas/Fees
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '../fees';
import { CreateFeeDto, UpdateFeeDto, FeeListParams } from '@/types/fee';

/**
 * Keys para caché de React Query
 */
export const feesKeys = {
  all: ['fees'] as const,
  lists: () => [...feesKeys.all, 'list'] as const,
  list: (params?: FeeListParams) => [...feesKeys.lists(), params] as const,
  details: () => [...feesKeys.all, 'detail'] as const,
  detail: (id: string) => [...feesKeys.details(), id] as const,
  current: (coachId?: string) => [...feesKeys.all, 'current', coachId] as const,
};

/**
 * Hook para obtener todas las cuotas
 */
export function useFees(params?: FeeListParams) {
  return useQuery({
    queryKey: feesKeys.list(params),
    queryFn: () => feesApi.getAll(params),
  });
}

/**
 * Hook para obtener cuota actual vigente
 */
export function useCurrentFee(activityType?: string, coachId?: string, enabled = true) {
  return useQuery({
    queryKey: feesKeys.current(activityType || coachId),
    queryFn: () => feesApi.getCurrent(activityType, coachId),
    enabled,
  });
}

/**
 * Hook para obtener una cuota específica
 */
export function useFee(feeId: string, enabled = true) {
  return useQuery({
    queryKey: feesKeys.detail(feeId),
    queryFn: () => feesApi.getById(feeId),
    enabled: enabled && !!feeId,
  });
}

/**
 * Hook para crear una nueva cuota
 */
export function useCreateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeeDto) => feesApi.create(data),
    onSuccess: () => {
      // Invalidar todas las queries de cuotas
      queryClient.invalidateQueries({
        queryKey: feesKeys.all,
      });
    },
  });
}

/**
 * Hook para actualizar una cuota
 */
export function useUpdateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feeId, data }: { feeId: string; data: UpdateFeeDto }) =>
      feesApi.update(feeId, data),
    onSuccess: (updatedFee) => {
      // Actualizar cuota específica en caché
      queryClient.setQueryData(
        feesKeys.detail(updatedFee.id),
        updatedFee
      );

      // Invalidar listas
      queryClient.invalidateQueries({
        queryKey: feesKeys.lists(),
      });

      // Invalidar cuota actual si es la que se actualizó
      if (updatedFee.isActive) {
        queryClient.invalidateQueries({
          queryKey: feesKeys.current(),
        });
      }
    },
  });
}

/**
 * Hook para eliminar una cuota
 */
export function useDeleteFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeId: string) => feesApi.delete(feeId),
    onSuccess: () => {
      // Invalidar todas las queries de cuotas
      queryClient.invalidateQueries({
        queryKey: feesKeys.all,
      });
    },
  });
}

/**
 * Hook para activar una cuota
 */
export function useActivateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeId: string) => feesApi.setActive(feeId),
    onSuccess: () => {
      // Invalidar todas las queries de cuotas
      queryClient.invalidateQueries({
        queryKey: feesKeys.all,
      });
    },
  });
}