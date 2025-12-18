"use client";

import React, { useState } from "react";
import { useExpiringPayments, useExpiredPayments, useForceCheckExpiring } from "@/lib/api/hooks/useNotifications";
import { useRouter } from "next/navigation";

export default function PaymentsDueWidgetBackend() {
  const router = useRouter();
  const [daysThreshold, setDaysThreshold] = useState(7); // Aumentado a 7 días por defecto
  
  const { data: expiringData, isLoading: isLoadingExpiring, refetch: refetchExpiring } = useExpiringPayments(daysThreshold);
  const { data: expiredData, isLoading: isLoadingExpired, refetch: refetchExpired } = useExpiredPayments();
  const forceCheckMutation = useForceCheckExpiring();

  const isLoading = isLoadingExpiring || isLoadingExpired;

  // Formatear monto sin decimales
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Combinar notificaciones vencidas y próximas a vencer
  const allNotifications = [
    ...(expiredData?.notifications || []).map(n => ({ ...n, isExpired: true })),
    ...(expiringData?.notifications || []).map(n => ({ ...n, isExpired: false })),
  ];

  // Determinar color según si está vencido o próximo
  const getStatusColor = (isExpired: boolean, expirationDate: string) => {
    if (isExpired) return "bg-red-600 text-white shadow-lg";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) return "bg-red-500 text-white shadow-lg animate-pulse";
    if (daysUntil === 1) return "bg-orange-600 text-white shadow-md";
    if (daysUntil <= 3) return "bg-orange-500 text-white shadow-md";
    return "bg-yellow-500 text-white shadow-sm";
  };

  const getStatusText = (isExpired: boolean, expirationDate: string) => {
    if (isExpired) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(expirationDate);
      expDate.setHours(0, 0, 0, 0);
      const daysAgo = Math.ceil((today.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
      return `VENCIDO hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) return "¡VENCE HOY!";
    if (daysUntil === 1) return "Vence MAÑANA";
    return `Faltan ${daysUntil} día${daysUntil !== 1 ? 's' : ''}`;
  };

  const handleForceCheck = async () => {
    try {
      await forceCheckMutation.mutateAsync(daysThreshold);
      await refetchExpiring();
      await refetchExpired();
    } catch (error) {
      console.error("Error al forzar verificación:", error);
    }
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

  if (allNotifications.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="text-2xl">✅</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Pagos al Día
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Todos los atletas activos están al día con sus pagos
            </p>
          </div>
          <button
            onClick={handleForceCheck}
            disabled={forceCheckMutation.isPending}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            {forceCheckMutation.isPending ? "Verificando..." : "🔄 Verificar"}
          </button>
        </div>
      </div>
    );
  }

  const expiredCount = expiredData?.found || 0;
  const expiringCount = expiringData?.found || 0;

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
            {expiredCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 font-medium text-white">
                {expiredCount} vencido(s)
              </span>
            )}
            {expiringCount > 0 && (
              <span className="rounded-full bg-yellow-500 px-2 py-0.5 font-medium text-white">
                {expiringCount} próximo(s)
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleForceCheck}
          disabled={forceCheckMutation.isPending}
          className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          title="Forzar verificación manual"
        >
          {forceCheckMutation.isPending ? "⏳" : "🔄"}
        </button>
      </div>

      {/* Selector de días */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-orange-700 dark:text-orange-300">Alertar con:</span>
        <select
          value={daysThreshold}
          onChange={(e) => setDaysThreshold(Number(e.target.value))}
          className="rounded-lg border border-orange-300 bg-white px-2 py-1 text-xs dark:border-orange-700 dark:bg-gray-800"
        >
          <option value={1}>1 día</option>
          <option value={3}>3 días</option>
          <option value={5}>5 días</option>
          <option value={7}>7 días</option>
        </select>
        <span className="text-orange-700 dark:text-orange-300">de anticipación</span>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-2">
        {allNotifications.map((notification) => (
          <div
            key={notification.athleteId}
            onClick={() => router.push(`/atletas/${notification.athleteId}`)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-orange-200 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-orange-800 dark:bg-gray-800/50"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {notification.athleteName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {notification.email}
              </p>
              {notification.phone && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  📱 {notification.phone}
                </p>
              )}
              {notification.activityType && (
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  {notification.activityType.replace(/_/g, ' ')}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Vence: {new Date(notification.expirationDate).toLocaleDateString("es-AR")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(notification.isExpired, notification.expirationDate)}`}
              >
                {getStatusText(notification.isExpired, notification.expirationDate)}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatAmount(notification.amount)}
              </span>
              {notification.quantity && notification.quantity > 1 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.quantity}x {notification.pricePerUnit ? formatAmount(notification.pricePerUnit) : 'N/A'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
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

      {/* Info del cron */}
      <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          ⏰ <strong>Sistema automático:</strong> Las notificaciones se verifican diariamente a las 9:00 AM
        </p>
      </div>
    </div>
  );
}
