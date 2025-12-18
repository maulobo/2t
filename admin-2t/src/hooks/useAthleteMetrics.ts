import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { athleteMetricsApi } from "@/lib/api/athlete-metrics";
import type {
  CreateAthleteMetricDto,
  UpdateAthleteMetricDto,
  WeightProgressResponse,
  PersonalRecordsResponse,
  BenchmarkRecordsResponse,
} from "@/types/athlete";

// Hook para obtener el historial completo de métricas de un atleta
export function useAthleteMetrics(athleteId: string) {
  return useQuery({
    queryKey: ["athlete-metrics", athleteId],
    queryFn: () => athleteMetricsApi.getHistory(athleteId),
    enabled: !!athleteId,
  });
}

// Hook para obtener la métrica más reciente de un atleta
export function useLatestMetric(athleteId: string) {
  return useQuery({
    queryKey: ["athlete-metrics", athleteId, "latest"],
    queryFn: () => athleteMetricsApi.getLatest(athleteId),
    enabled: !!athleteId,
  });
}

// Hook para obtener el progreso de peso de un atleta
export function useWeightProgress(athleteId: string) {
  return useQuery<WeightProgressResponse>({
    queryKey: ["athlete-metrics", athleteId, "weight-progress"],
    queryFn: () => athleteMetricsApi.getWeightProgress(athleteId),
    enabled: !!athleteId,
    retry: false,
  });
}

// Hook para obtener los records personales (1RM) de un atleta
export function usePersonalRecords(athleteId: string) {
  return useQuery<PersonalRecordsResponse>({
    queryKey: ["athlete-metrics", athleteId, "personal-records"],
    queryFn: () => athleteMetricsApi.getPersonalRecords(athleteId),
    enabled: !!athleteId,
    retry: false,
  });
}

// Hook para obtener los records de benchmark WODs de un atleta
export function useBenchmarkRecords(athleteId: string) {
  return useQuery<BenchmarkRecordsResponse>({
    queryKey: ["athlete-metrics", athleteId, "benchmark-records"],
    queryFn: () => athleteMetricsApi.getBenchmarkRecords(athleteId),
    enabled: !!athleteId,
    retry: false,
  });
}

// Hook para crear una nueva métrica
export function useCreateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAthleteMetricDto) =>
      athleteMetricsApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidar todas las queries relacionadas con las métricas de este atleta
      queryClient.invalidateQueries({
        queryKey: ["athlete-metrics", variables.athleteId],
      });
      queryClient.invalidateQueries({
        queryKey: ["athletes", variables.athleteId],
      });
    },
  });
}

// Hook para actualizar una métrica existente
export function useUpdateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAthleteMetricDto }) =>
      athleteMetricsApi.update(id, data),
    onSuccess: (data) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ["athlete-metrics", data.athleteId],
      });
      queryClient.invalidateQueries({
        queryKey: ["athletes", data.athleteId],
      });
    },
  });
}

// Hook para eliminar una métrica
export function useDeleteMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => athleteMetricsApi.delete(id),
    onSuccess: () => {
      // Invalidar todas las queries de métricas
      queryClient.invalidateQueries({
        queryKey: ["athlete-metrics"],
      });
    },
  });
}
