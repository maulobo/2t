"use client";
import React, { useMemo } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "@/icons";
import { useAthletes } from "@/lib/api/hooks/useAthletes";
import type { Athlete, Payment } from "@/types/athlete";

export const AthletesMetrics = () => {
  const { data: athletesData, isLoading } = useAthletes({ active: true });
  const { data: allAthletesData } = useAthletes({});

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalAthletes = allAthletesData?.athletes?.length || 0;
    const activeAthletes = athletesData?.athletes?.length || 0;
    const inactiveAthletes = totalAthletes - activeAthletes;

    // Calcular atletas con pagos activos
    const athletesWithActivePayments = athletesData?.athletes?.filter((athlete: Athlete) => {
      const approvedPayments = athlete.payments?.filter((p: Payment) => p.status === 'APPROVED') || [];
      if (approvedPayments.length === 0) return false;

      const now = new Date();
      return approvedPayments.some((payment: Payment) => {
        const endDate = new Date(payment.periodEnd);
        return endDate >= now;
      });
    }).length || 0;

    // Calcular atletas con pagos vencidos
    const athletesWithExpiredPayments = athletesData?.athletes?.filter((athlete: Athlete) => {
      const approvedPayments = athlete.payments?.filter((p: Payment) => p.status === 'APPROVED') || [];
      if (approvedPayments.length === 0) return true; // Sin pagos = vencido

      const now = new Date();
      const allExpired = approvedPayments.every((payment: Payment) => {
        const endDate = new Date(payment.periodEnd);
        return endDate < now;
      });
      return allExpired;
    }).length || 0;

    // Calcular porcentajes
    const activePercentage = totalAthletes > 0 
      ? ((activeAthletes / totalAthletes) * 100).toFixed(1)
      : '0.0';

    const paidPercentage = activeAthletes > 0 
      ? ((athletesWithActivePayments / activeAthletes) * 100).toFixed(1)
      : '0.0';

    return {
      totalAthletes,
      activeAthletes,
      inactiveAthletes,
      athletesWithActivePayments,
      athletesWithExpiredPayments,
      activePercentage,
      paidPercentage,
    };
  }, [athletesData, allAthletesData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-5 space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Total Atletas Activos --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <GroupIcon className="size-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Atletas Activos
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {metrics.activeAthletes}
            </h4>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Total: {metrics.totalAthletes} ({metrics.inactiveAthletes} inactivos)
            </p>
          </div>
          <Badge color={Number(metrics.activePercentage) >= 80 ? "success" : "warning"}>
            {Number(metrics.activePercentage) >= 80 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon className="text-warning-500" />
            )}
            {metrics.activePercentage}%
          </Badge>
        </div>
      </div>
      {/* <!-- Total Atletas Activos End --> */}

      {/* <!-- Atletas con Pagos al Día --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
          <svg
            className="size-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pagos al Día
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {metrics.athletesWithActivePayments}
            </h4>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {metrics.athletesWithExpiredPayments} vencido(s)
            </p>
          </div>

          <Badge color={Number(metrics.paidPercentage) >= 70 ? "success" : "error"}>
            {Number(metrics.paidPercentage) >= 70 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon className="text-error-500" />
            )}
            {metrics.paidPercentage}%
          </Badge>
        </div>
      </div>
      {/* <!-- Atletas con Pagos al Día End --> */}
    </div>
  );
};
