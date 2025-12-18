"use client";

import React, { useMemo } from "react";
import { useAthletes } from "@/lib/api/hooks/useAthletes";

export default function AthleteGrowthChart() {
  const { data: athletesData, isLoading } = useAthletes({});

  const growthData = useMemo(() => {
    if (!athletesData?.athletes) return [];

    // Obtener atletas con fecha de creación
    const athletes = athletesData.athletes;

    // Agrupar por mes
    const monthlyData = new Map<string, { new: number; total: number }>();

    // Ordenar por fecha de creación
    const sortedAthletes = [...athletes].sort((a, b) => 
      new Date(a.user.createdAt).getTime() - new Date(b.user.createdAt).getTime()
    );

    let runningTotal = 0;

    sortedAthletes.forEach((athlete) => {
      const date = new Date(athlete.user.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthlyData.get(monthKey) || { new: 0, total: 0 };
      runningTotal++;
      
      monthlyData.set(monthKey, {
        new: existing.new + 1,
        total: runningTotal,
      });
    });

    // Obtener últimos 6 meses
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
      
      const data = monthlyData.get(monthKey) || { new: 0, total: runningTotal };
      
      last6Months.push({
        month: monthName,
        monthKey,
        new: data.new,
        total: data.total,
      });
    }

    return last6Months;
  }, [athletesData]);

  const maxValue = Math.max(...growthData.map(d => d.total), 1);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const currentMonth = growthData[growthData.length - 1];
  const previousMonth = growthData[growthData.length - 2];
  const growth = previousMonth ? currentMonth.new - previousMonth.new : currentMonth.new;
  const growthPercentage = previousMonth && previousMonth.new > 0
    ? ((growth / previousMonth.new) * 100).toFixed(1)
    : '0';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crecimiento de Atletas
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Últimos 6 meses
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentMonth?.new || 0}
          </div>
          <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${
            growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {growth >= 0 ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span>{Math.abs(Number(growthPercentage))}%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="space-y-4">
        {growthData.map((data, index) => (
          <div key={data.monthKey} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {data.month}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-green-600 dark:text-green-400">
                  +{data.new} nuevo{data.new !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Total: {data.total}
                </span>
              </div>
            </div>
            <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full transition-all duration-500 ${
                  index === growthData.length - 1
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}
                style={{ width: `${(data.total / maxValue) * 100}%` }}
              >
                <div className="flex h-full items-center justify-end pr-2">
                  {data.new > 0 && (
                    <span className="text-xs font-semibold text-white">
                      +{data.new}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total acumulado */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Atletas
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Desde el inicio
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {currentMonth?.total || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
