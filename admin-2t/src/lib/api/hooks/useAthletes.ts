/**
 * Hooks personalizados para manejar estado de atletas en Client Components
 * Usa React Query para caché y revalidación automática
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { athletesApi } from '../athletes';
import { AthleteListParams, CreateAthleteDto, UpdateAthleteDto } from '@/types/athlete';

// Keys para el caché de React Query
export const athletesKeys = {
  all: ['athletes'] as const,
  lists: () => [...athletesKeys.all, 'list'] as const,
  list: (params: AthleteListParams) => [...athletesKeys.lists(), params] as const,
  details: () => [...athletesKeys.all, 'detail'] as const,
  detail: (id: string) => [...athletesKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de atletas con paginación
 */
export function useAthletes(params: AthleteListParams = {}) {
  return useQuery({
    queryKey: athletesKeys.list(params),
    queryFn: () => athletesApi.getAll(params),
    staleTime: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener un atleta por ID
 */
export function useAthlete(id: string) {
  return useQuery({
    queryKey: athletesKeys.detail(id),
    queryFn: () => athletesApi.getById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para crear un atleta
 */
export function useCreateAthlete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAthleteDto) => athletesApi.create(data),
    onSuccess: () => {
      // Invalidar todas las listas de atletas para recargarlas
      queryClient.invalidateQueries({ queryKey: athletesKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un atleta
 */
export function useUpdateAthlete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAthleteDto }) =>
      athletesApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar el detalle del atleta y todas las listas
      queryClient.invalidateQueries({ queryKey: athletesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: athletesKeys.lists() });
    },
  });
}

/**
 * Hook para eliminar un atleta
 */
export function useDeleteAthlete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => athletesApi.delete(id),
    onSuccess: () => {
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: athletesKeys.lists() });
    },
  });
}

/**
 * Hook para activar/desactivar un atleta
 */
export function useToggleAthleteActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      athletesApi.toggleActive(id, active),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: athletesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: athletesKeys.lists() });
    },
  });
}
