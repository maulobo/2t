"use client";

import React from "react";
import { usePaymentsDue } from "@/hooks/usePaymentsDue";
import { useRouter } from "next/navigation";

export default function PaymentsDueWidget() {
  const router = useRouter();
  const { athletesWithDuePayments, stats, isLoading } = usePaymentsDue(3);

  // Formatear monto sin decimales
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (athletesWithDuePayments.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Pagos al Día
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Todos los atletas activos están al día con sus pagos
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-lg dark:border-orange-700 dark:from-orange-900/20 dark:to-orange-800/20">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 shadow-md">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
            Pagos Próximos a Vencer
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {stats.overdue > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 font-medium text-white">
                {stats.overdue} vencido(s)
              </span>
            )}
            {stats.dueToday > 0 && (
              <span className="rounded-full bg-red-400 px-2 py-0.5 font-medium text-white">
                {stats.dueToday} vence hoy
              </span>
            )}
            {stats.dueSoon > 0 && (
              <span className="rounded-full bg-yellow-500 px-2 py-0.5 font-medium text-white">
                {stats.dueSoon} próximo(s)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de atletas */}
      <div className="space-y-2">
        {athletesWithDuePayments.map((item) => {
          const { athlete, lastPayment, daysUntilDue } = item!;
          
          // Determinar color según días restantes
          const getStatusColor = (days: number) => {
            if (days < 0) return "bg-red-500 text-white"; // Vencido
            if (days === 0) return "bg-red-400 text-white"; // Vence hoy
            if (days === 1) return "bg-orange-500 text-white"; // Vence mañana
            return "bg-yellow-500 text-white"; // 2-3 días
          };

          const getStatusText = (days: number) => {
            if (days < 0) return `Vencido hace ${Math.abs(days)} día(s)`;
            if (days === 0) return "Vence HOY";
            if (days === 1) return "Vence MAÑANA";
            return `Vence en ${days} día(s)`;
          };

          return (
            <div
              key={athlete.id}
              onClick={() => router.push(`/atletas/${athlete.id}`)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-orange-200 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-orange-800 dark:bg-gray-800/50"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {athlete.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {athlete.user.email}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Período: {new Date(lastPayment.periodStart).toLocaleDateString("es-AR")} -{" "}
                  {new Date(lastPayment.periodEnd).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(daysUntilDue)}`}
                >
                  {getStatusText(daysUntilDue)}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatAmount(lastPayment.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div className="mt-4 flex items-center justify-between border-t border-orange-200 pt-4 dark:border-orange-800">
        <p className="text-xs text-orange-700 dark:text-orange-300">
          💡 Click en un atleta para ver detalles
        </p>
        <button
          onClick={() => router.push("/atletas")}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Ver Todos
        </button>
      </div>
    </div>
  );
}
