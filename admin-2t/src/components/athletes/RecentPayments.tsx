"use client";
import React from "react";
import { useAthletes } from "@/lib/api/hooks/useAthletes";
import type { Payment, Athlete } from "@/types/athlete";
import { useRouter } from "next/navigation";

export default function RecentPayments() {
  const { data: athletesData, isLoading } = useAthletes({ active: true });
  const router = useRouter();

  // Formatear monto sin decimales
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Obtener los últimos 10 pagos aprobados
  const recentPayments = React.useMemo(() => {
    if (!athletesData?.athletes) return [];

    const allPayments: Array<Payment & { athlete: Athlete }> = [];

    athletesData.athletes.forEach((athlete) => {
      athlete.payments
        ?.filter((p: Payment) => p.status === 'APPROVED')
        .forEach((payment: Payment) => {
          allPayments.push({ ...payment, athlete });
        });
    });

    // Ordenar por fecha de aprobación (más reciente primero)
    return allPayments
      .sort((a, b) => {
        const dateA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
        const dateB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [athletesData]);

  const getPaymentStatus = (payment: Payment) => {
    const now = new Date();
    const endDate = new Date(payment.periodEnd);
    
    if (endDate < now) {
      return { text: "Vencido", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
    }
    
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 3) {
      return { text: "Por vencer", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" };
    }
    
    return { text: "Activo", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" };
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Últimos Pagos Aprobados
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Los 10 pagos más recientes
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Atleta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actividad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Fecha Aprobación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {recentPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay pagos aprobados aún
                </td>
              </tr>
            ) : (
              recentPayments.map((payment) => {
                const status = getPaymentStatus(payment);
                return (
                  <tr
                    key={payment.id}
                    onClick={() => router.push(`/atletas/${payment.athlete.id}`)}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {payment.athlete.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {payment.athlete.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.athlete.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.activityType ? (
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          {payment.activityType.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {formatAmount(payment.amount)}
                        </p>
                        {payment.quantity && payment.quantity > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.quantity}x {payment.pricePerUnit ? formatAmount(payment.pricePerUnit) : 'N/A'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(payment.periodStart).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                        })}
                        {" - "}
                        {new Date(payment.periodEnd).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.approvedAt
                          ? new Date(payment.approvedAt).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
