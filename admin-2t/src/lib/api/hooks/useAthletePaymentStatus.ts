/**
 * Hook personalizado para el estado de pago del atleta
 * Encapsula toda la lógica de negocio del dashboard
 */

import { useState, useEffect } from 'react';
import { paymentsApi } from '../payments';
import { athletesApi } from '../athletes';

export interface PaymentStatus {
  amount: number;
  nextPaymentDate: string;
  daysUntilDue: number;
  isExpired: boolean;
  isNearExpiration: boolean; // <= 3 days
}

/**
 * Hook para obtener el estado de pago de un atleta
 * Maneja toda la lógica de negocio:
 * - Obtener el athleteId desde el userId
 * - Filtrar pagos aprobados
 * - Calcular días hasta vencimiento
 * - Determinar estados (expirado, por vencer)
 */
export function useAthletePaymentStatus(userId: string | undefined) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      // Verificar que el usuario exista
      if (!userId) {
        console.log('[useAthletePaymentStatus] No userId provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Primero obtener el athleteId desde el userId
        console.log('[useAthletePaymentStatus] Fetching athlete profile for userId:', userId);
        const athlete = await athletesApi.getByUserId(userId);
        console.log('[useAthletePaymentStatus] Found athlete:', athlete.id, athlete.fullName);
        
        // Ahora obtener los pagos con el athleteId
        console.log('[useAthletePaymentStatus] Fetching payments for athleteId:', athlete.id);
        const payments = await paymentsApi.getByAthlete(athlete.id);
        
        console.log('[useAthletePaymentStatus] Received payments:', payments.length, 'total');
        
        // Get the most recent APPROVED payment
        const approvedPayments = payments
          .filter((p) => p.status === 'APPROVED')
          .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());

        console.log('[useAthletePaymentStatus] Approved payments:', approvedPayments.length);

        if (approvedPayments.length > 0) {
          const lastPayment = approvedPayments[0];
          
          console.log('[useAthletePaymentStatus] Last payment:', {
            amount: lastPayment.amount,
            periodEnd: lastPayment.periodEnd,
            status: lastPayment.status,
          });
          
          // Calculate days until due
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const endDate = new Date(lastPayment.periodEnd);
          endDate.setHours(0, 0, 0, 0);
          
          const diffTime = endDate.getTime() - today.getTime();
          const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          console.log('[useAthletePaymentStatus] Days until due:', daysUntilDue);
          
          setPaymentStatus({
            amount: lastPayment.amount,
            nextPaymentDate: lastPayment.periodEnd,
            daysUntilDue,
            isExpired: daysUntilDue < 0,
            isNearExpiration: daysUntilDue <= 3 && daysUntilDue >= 0,
          });
        } else {
          console.log('[useAthletePaymentStatus] No approved payments found');
          setPaymentStatus(null);
        }
      } catch (err) {
        console.error('[useAthletePaymentStatus] Error fetching payment status:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [userId]);

  return { paymentStatus, loading, error };
}
