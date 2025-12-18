"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CreatePaymentForm from "@/components/payments/CreatePaymentForm";
import { usePendingPayments, useApprovePayment, useRejectPayment } from "@/lib/api/hooks/usePayments";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Badge from "@/components/ui/badge/Badge";

export default function PaymentsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Hooks
  const { data: pendingPayments, isLoading, error } = usePendingPayments();
  const approvePaymentMutation = useApprovePayment();
  const rejectPaymentMutation = useRejectPayment();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  };

  const handleApprove = async (paymentId: string) => {
    if (confirm("¿Aprobar este pago?")) {
      try {
        await approvePaymentMutation.mutateAsync(paymentId);
        alert("Pago aprobado exitosamente");
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleReject = async (paymentId: string) => {
    if (confirm("¿Rechazar este pago?")) {
      try {
        await rejectPaymentMutation.mutateAsync(paymentId);
        alert("Pago rechazado");
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Pagos" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario de crear pago */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Registrar Pago
              </h3>
              {showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Ocultar
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Mostrar
                </button>
              )}
            </div>
            <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
              {showCreateForm ? (
                <CreatePaymentForm
                  onSuccess={() => {
                    alert("Pago registrado exitosamente!");
                  }}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-gray-500 dark:text-gray-400">
                    Click en "Mostrar" para registrar un nuevo pago
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
                  >
                    + Nuevo Pago
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de pagos pendientes */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Pagos Pendientes ({pendingPayments?.length || 0})
              </h3>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-primary hover:underline"
              >
                Actualizar
              </button>
            </div>
            <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-600">
                  Error al cargar pagos pendientes
                </div>
              ) : !pendingPayments || pendingPayments.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay pagos pendientes de aprobación
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Atleta ID: {payment.athleteId}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Registrado: {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        <Badge size="sm" color="warning">
                          Pendiente
                        </Badge>
                      </div>

                      <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Monto</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </p>
                          {payment.quantity && payment.quantity > 1 && payment.pricePerUnit && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {payment.quantity}x ${payment.pricePerUnit.toLocaleString("es-AR")}
                            </p>
                          )}
                          {payment.activityType && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {payment.activityType.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Período</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                          </p>
                        </div>
                      </div>

                      {payment.evidenceText && (
                        <div className="mb-3 rounded bg-gray-100 p-2 dark:bg-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {payment.evidenceText}
                        </p>
                        </div>
                      )}

                      {payment.evidenceUrl && (
                        <div className="mb-3">
                          <a
                            href={payment.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Ver comprobante
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(payment.id)}
                          disabled={approvePaymentMutation.isPending}
                          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(payment.id)}
                          disabled={rejectPaymentMutation.isPending}
                          className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
