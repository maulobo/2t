/**
 * Índice centralizado de APIs
 * Facilita las importaciones y mantiene consistencia
 */

// APIs
export { apiClient } from './client';
export { athletesApi } from './athletes';
export { paymentsApi } from './payments';
export * as trainingsApi from './trainings';
export { feesApi } from './fees';
export { notificationsApi } from './notifications';
export { athleteMetricsApi } from './athlete-metrics';
export { athleteActivitiesApi } from './athlete-activities';
export * as forumsApi from './forums';

// Hooks
export * from './hooks/useAthletes';
export * from './hooks/usePayments';
export * from './hooks/useTrainings';
export * from './hooks/useFees';
export * from './hooks/useNotifications';
export * from './hooks/useAthleteActivities';
export * from './hooks/useAthletePaymentStatus';
export * from './hooks/useAthleteId';
export * from './hooks/useForums';
export * from './hooks/useUnreadForumPosts';
// useCurrentAthletePayments se exporta desde su propio archivo para evitar conflictos

// Types (re-export si son necesarios)
export type { CreatePaymentDto, PaymentListParams } from './payments';
export type { CreateTrainingDto, UpdateTrainingDto, GetTrainingsParams } from './trainings';
export type { CreateForumPostDto, UpdateForumPostDto } from '@/types/athlete';
