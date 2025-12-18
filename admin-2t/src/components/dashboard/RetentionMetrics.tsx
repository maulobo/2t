"use client";

import React, { useMemo } from "react";
import { useAthletes } from "@/lib/api/hooks/useAthletes";
import type { Athlete, Payment } from "@/types/athlete";

export default function RetentionMetrics() {
  const { data: athletesData, isLoading } = useAthletes({});

  const metrics = useMemo(() => {
    if (!athletesData?.athletes) {
      return {
        retention: 0,
        conversion: 0,
        churnRate: 0,
        averageLifetime: 0,
        activeWithPayment: 0,
        activeWithoutPayment: 0,
        projectedRevenue: 0,
      };
    }

    const athletes = athletesData.athletes;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Atletas activos
    const activeAthletes = athletes.filter((a: Athlete) => a.active);
    
    // Atletas activos con pagos vigentes
    const activeWithValidPayment = activeAthletes.filter((a: Athlete) => {
      const approvedPayments = a.payments?.filter((p: Payment) => p.status === 'APPROVED') || [];
      return approvedPayments.some((p: Payment) => new Date(p.periodEnd) >= now);
    });

    // Atletas activos sin pagos vigentes
    const activeWithoutValidPayment = activeAthletes.length - activeWithValidPayment.length;

    // Atletas que se unieron hace más de 30 días
    const athletesOlderThan30Days = athletes.filter((a: Athlete) => 
      new Date(a.user.createdAt) <= thirtyDaysAgo
    );

    // De esos, cuántos siguen activos con pago vigente
    const retainedAthletes = athletesOlderThan30Days.filter((a: Athlete) => {
      if (!a.active) return false;
      const approvedPayments = a.payments?.filter((p: Payment) => p.status === 'APPROVED') || [];
      return approvedPayments.some((p: Payment) => new Date(p.periodEnd) >= now);
    });

    // Tasa de retención (%)
    const retention = athletesOlderThan30Days.length > 0
      ? (retainedAthletes.length / athletesOlderThan30Days.length) * 100
      : 0;

    // Tasa de conversión (pendientes → aprobados)
    const allPayments = athletes.flatMap((a: Athlete) => a.payments || []);
    const pendingPayments = allPayments.filter((p: Payment) => p.status === 'PENDING').length;
    const approvedPayments = allPayments.filter((p: Payment) => p.status === 'APPROVED').length;
    const totalPayments = pendingPayments + approvedPayments;
    
    const conversion = totalPayments > 0
      ? (approvedPayments / totalPayments) * 100
      : 0;

    // Tasa de abandono (churn rate)
    const churnRate = 100 - retention;

    // Vida promedio del cliente (en meses)
    const totalLifetimeMonths = athletes.reduce((sum: number, a: Athlete) => {
      const joinDate = new Date(a.user.createdAt);
      const endDate = a.active ? now : new Date(a.user.updatedAt);
      const months = Math.max(0, (endDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return sum + months;
    }, 0);
    
    const averageLifetime = athletes.length > 0 && !isNaN(totalLifetimeMonths)
      ? Math.round((totalLifetimeMonths / athletes.length) * 10) / 10
      : 0;

    // Ingresos proyectados (basado en pagos activos)
    const projectedRevenue = activeWithValidPayment.reduce((sum: number, a: Athlete) => {
      const validPayments = a.payments?.filter((p: Payment) => 
        p.status === 'APPROVED' && new Date(p.periodEnd) >= now
      ) || [];
      
      if (validPayments.length > 0) {
        // Usar el pago más reciente
        const latestPayment = validPayments.sort((a, b) => 
          new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
        )[0];
        return sum + latestPayment.amount;
      }
      return sum;
    }, 0);

    return {
      retention: Math.round(retention * 10) / 10,
      conversion: Math.round(conversion * 10) / 10,
      churnRate: Math.round(churnRate * 10) / 10,
      averageLifetime: Math.round(averageLifetime * 10) / 10,
      activeWithPayment: activeWithValidPayment.length,
      activeWithoutPayment: activeWithoutValidPayment,
      projectedRevenue,
    };
  }, [athletesData]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Métricas de Negocio
      </h3>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tasa de Retención */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Tasa de Retención
            </p>
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${
              metrics.retention >= 80 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : metrics.retention >= 60
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {metrics.retention >= 80 ? 'Excelente' : metrics.retention >= 60 ? 'Buena' : 'Mejorar'}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metrics.retention}%
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Atletas +30 días que renuevan
          </p>
        </div>

        {/* Tasa de Conversión */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Conversión de Pagos
            </p>
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${
              metrics.conversion >= 90 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : metrics.conversion >= 70
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {metrics.conversion >= 90 ? 'Excelente' : metrics.conversion >= 70 ? 'Buena' : 'Mejorar'}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metrics.conversion}%
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Pendientes → Aprobados
          </p>
        </div>

        {/* Vida Promedio */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Vida Promedio Cliente
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metrics.averageLifetime}
            </p>
            <span className="text-sm text-gray-500">meses</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Desde registro hasta hoy
          </p>
        </div>

        {/* Tasa de Abandono */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Tasa de Abandono
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {metrics.churnRate}%
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            No renovaron después de 30 días
          </p>
        </div>

        {/* Activos con Pago */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Activos con Cuota Al Día
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {metrics.activeWithPayment}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Con pagos vigentes
          </p>
        </div>

        {/* Ingresos Proyectados */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Ingresos Mensuales Proyectados
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(metrics.projectedRevenue)}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Basado en pagos activos
          </p>
        </div>
      </div>

      {/* Alerta de atletas sin pago */}
      {metrics.activeWithoutPayment > 0 && (
        <div className="mt-6 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                {metrics.activeWithoutPayment} atleta{metrics.activeWithoutPayment !== 1 ? 's' : ''} activo{metrics.activeWithoutPayment !== 1 ? 's' : ''} sin cuota vigente
              </p>
              <p className="mt-1 text-xs text-orange-700 dark:text-orange-400">
                Revisa su estado de pago para evitar abandono
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
