"use client";

import { useAuth } from '@/context/AuthContext';
import { useCurrentAthletePayments } from '@/lib/api/hooks/useAthletePayments';
// Hook personalizado para obtener pagos del atleta actual

import { Payment } from '@/types/athlete';
import { useState } from 'react';

export default function AthletePaymentsPage() {
  const { user } = useAuth();
  const { payments, loading, error } = useCurrentAthletePayments(user?.id);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  // Filtrar pagos según el estado seleccionado
  const filteredPayments = filterStatus === 'ALL' 
    ? payments 
    : payments?.filter((p: Payment) => p.status === filterStatus);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear monto
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Badge de estado
  const getStatusBadge = (status: string) => {
    const badges = {
      APPROVED: { 
        text: 'Aprobado', 
        class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
      },
      PENDING: { 
        text: 'Pendiente', 
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
      },
      REJECTED: { 
        text: 'Rechazado', 
        class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mis Pagos
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Historial completo de tus pagos y cuotas
        </p>
      </div>

      {/* Filtros */}
      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({payments?.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'APPROVED'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Aprobados ({payments?.filter((p: Payment) => p.status === 'APPROVED').length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'PENDING'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pendientes ({payments?.filter((p: Payment) => p.status === 'PENDING').length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'REJECTED'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Rechazados ({payments?.filter((p: Payment) => p.status === 'REJECTED').length || 0})
          </button>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="rounded-xl bg-white shadow dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              Error al cargar los pagos
            </p>
          </div>
        ) : !filteredPayments || filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              No hay pagos para mostrar
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPayments.map((payment: Payment) => (
              <div key={payment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(payment.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Registrado el {formatDate(payment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatAmount(payment.amount)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.activityType && `• ${payment.activityType}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Período: {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}</span>
                        </div>
                      </div>

                      {payment.quantity && payment.quantity > 1 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.quantity} unidades × {formatAmount(payment.pricePerUnit || 0)} c/u
                        </div>
                      )}
                    </div>

                    {/* Evidencia */}
                    {payment.evidenceText && (
                      <div className="mt-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Nota:</span> {payment.evidenceText}
                        </p>
                      </div>
                    )}

                    {payment.evidenceUrl && (
                      <a
                        href={payment.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Ver comprobante
                      </a>
                    )}
                  </div>

                  {/* Icono de estado */}
                  <div className={`flex-shrink-0 rounded-full p-2 ${
                    payment.status === 'APPROVED' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : payment.status === 'REJECTED'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    {payment.status === 'APPROVED' ? (
                      <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : payment.status === 'REJECTED' ? (
                      <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      {payments && payments.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumen
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {formatAmount(
                  payments
                    .filter((p: Payment) => p.status === 'APPROVED')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatAmount(
                  payments
                    .filter((p: Payment) => p.status === 'PENDING')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {payments.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
