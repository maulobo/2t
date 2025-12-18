/**
 * Hook personalizado para obtener pagos del atleta actual
 * Maneja la resolución de athleteId desde userId
 */

import { useState, useEffect } from 'react';
import { paymentsApi } from '../payments';
import { athletesApi } from '../athletes';
import { Payment } from '@/types/athlete';

/**
 * Hook para obtener todos los pagos del usuario atleta actual
 * Resuelve automáticamente el athleteId desde el userId
 * Similar a useAthletePaymentStatus pero retorna todos los pagos
 */
export function useCurrentAthletePayments(userId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userId) {
        console.log('[useCurrentAthletePayments] No userId provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Obtener el athleteId desde el userId
        console.log('[useCurrentAthletePayments] Fetching athlete for userId:', userId);
        const athlete = await athletesApi.getByUserId(userId);
        
        // Obtener todos los pagos del atleta
        console.log('[useCurrentAthletePayments] Fetching payments for athleteId:', athlete.id);
        const paymentsData = await paymentsApi.getByAthlete(athlete.id);
        
        // Ordenar por fecha de creación (más reciente primero)
        const sortedPayments = paymentsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        console.log('[useCurrentAthletePayments] Loaded payments:', sortedPayments.length);
        setPayments(sortedPayments);
      } catch (err) {
        console.error('[useCurrentAthletePayments] Error fetching payments:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  return { payments, loading, error };
}
