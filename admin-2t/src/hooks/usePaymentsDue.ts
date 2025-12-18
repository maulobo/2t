import { useMemo } from "react";
import { useAthletes } from "@/lib/api/hooks/useAthletes";
import { Payment, Athlete } from "@/types/athlete";

interface AthleteWithDuePayment {
  athlete: Athlete;
  lastPayment: Payment;
  daysUntilDue: number;
  isOverdue: boolean;
}

/**
 * Hook para obtener atletas con pagos próximos a vencer
 * @param daysThreshold - Número de días de anticipación (default: 3)
 * @returns Lista de atletas con pagos próximos a vencer, ordenados por urgencia
 */
export function usePaymentsDue(daysThreshold: number = 3) {
  const { data: athletesData, isLoading, error } = useAthletes({ 
    page: 1, 
    pageSize: 100 
  });

  const athletesWithDuePayments = useMemo(() => {
    if (!athletesData?.athletes) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return athletesData.athletes
      .filter((athlete) => athlete.active) // Solo atletas activos
      .map((athlete) => {
        // Obtener el último pago aprobado
        const lastPayment = athlete.payments
          .filter((p) => p.status === "APPROVED")
          .sort((a, b) => 
            new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
          )[0];

        if (!lastPayment) return null;

        // Calcular días hasta el vencimiento
        const endDate = new Date(lastPayment.periodEnd);
        endDate.setHours(0, 0, 0, 0);
        
        const diffTime = endDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Incluir solo si vence en N días o menos (incluyendo vencidos)
        if (daysUntilDue <= daysThreshold) {
          return {
            athlete,
            lastPayment,
            daysUntilDue,
            isOverdue: daysUntilDue < 0,
          } as AthleteWithDuePayment;
        }

        return null;
      })
      .filter((item): item is AthleteWithDuePayment => item !== null)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue); // Ordenar por urgencia
  }, [athletesData, daysThreshold]);

  // Estadísticas
  const stats = useMemo(() => {
    const overdue = athletesWithDuePayments.filter((item) => item.isOverdue).length;
    const dueToday = athletesWithDuePayments.filter((item) => item.daysUntilDue === 0).length;
    const dueSoon = athletesWithDuePayments.filter((item) => item.daysUntilDue > 0).length;

    return {
      total: athletesWithDuePayments.length,
      overdue,
      dueToday,
      dueSoon,
    };
  }, [athletesWithDuePayments]);

  return {
    athletesWithDuePayments,
    stats,
    isLoading,
    error,
  };
}
