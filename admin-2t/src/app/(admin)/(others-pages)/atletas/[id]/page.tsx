"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AthletePersonalInfo from "@/components/athletes/AthletePersonalInfo";
import AthleteActivitiesManager from "@/components/athletes/AthleteActivitiesManager";
import { AthleteMetrics } from "@/components/athletes/AthleteMetrics";
import { useAthlete } from "@/lib/api/hooks/useAthletes";
import { useAthletePayments } from "@/lib/api/hooks/usePayments";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Tab = "info" | "payments" | "metrics" | "wods";

export default function AthleteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("info");

 const { data: athlete, isLoading, error } = useAthlete(athleteId);
 console.log(athlete)
  const { 
    data: payments, 
    isLoading: isLoadingPayments, 
    error: paymentsError 
  } = useAthletePayments(athleteId, !!athlete);
 

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando atleta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl text-red-600">Error al cargar el atleta</p>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{error.message}</p>
          <button
            onClick={() => router.push("/atletas")}
            className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Volver a Atletas
          </button>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
            Atleta no encontrado
          </p>
          <button
            onClick={() => router.push("/atletas")}
            className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Volver a Atletas
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    const labels = {
      PENDING: "Pendiente",
      APPROVED: "Aprobado",
      REJECTED: "Rechazado",
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const tabs = [
    { id: "info" as Tab, name: " Información Personal", icon: "👤" },
    { id: "payments" as Tab, name: " Pagos" },
    { id: "metrics" as Tab, name: " Métricas"},
    { id: "wods" as Tab, name: " WODs"},
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={athlete.fullName} />

      {/* Header con estadísticas */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Pagos</p>
          <p className="text-2xl font-bold text-primary">
            {athlete._count?.payments || athlete.payments?.length || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">WODs Asignados</p>
          <p className="text-2xl font-bold text-primary">
            {athlete._count?.assignments || athlete.assignments?.length || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Actividades</p>
          <p className="text-2xl font-bold text-primary">
            {athlete._count?.activities || athlete.activities?.length || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Métricas</p>
          <p className="text-2xl font-bold text-primary">
            {athlete._count?.metrics || athlete.metrics?.length || 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div>
        {activeTab === "info" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AthletePersonalInfo athlete={athlete} />
            </div>
            <div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                  Actividades
                </h3>
                <AthleteActivitiesManager
                  athleteId={athlete.id}
                  athleteName={athlete.fullName}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Historial de Pagos
              </h3>
              <button
                onClick={() => router.push(`/pagos?athleteId=${athlete.id}`)}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                Nuevo Pago
              </button>
            </div>

            {isLoadingPayments ? (
              <div className="py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando pagos...</p>
              </div>
            ) : paymentsError ? (
              <div className="py-8 text-center text-red-500 dark:text-red-400">
                Error al cargar los pagos
              </div>
            ) : !payments || payments.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No hay pagos registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Período
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Monto
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Estado
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Fecha
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Actividad Pagada
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 text-sm text-gray-900 dark:text-white">
                          {formatDate(payment.periodStart)} -{" "}
                          {formatDate(payment.periodEnd)}
                        </td>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                          {payment.quantity && payment.quantity > 1 && payment.pricePerUnit && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {payment.quantity}x ${payment.pricePerUnit.toLocaleString("es-AR")}
                            </div>
                          )}
                          {payment.activityType && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {payment.activityType.replace(/_/g, ' ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3">{getStatusBadge(payment.status)}</td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(payment.createdAt)}
                          {payment.approvedAt && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Aprobado: {formatDate(payment.approvedAt)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {payment.activity ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: payment.activity.color }}
                              />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {payment.activity.name}
                              </span>
                            </div>
                          ) : payment.activityType ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              {payment.activityType.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-400">Sin actividad asociada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <AthleteMetrics athleteId={athleteId} />
          </div>
        )}

        {activeTab === "wods" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              🏋️ WODs Asignados
            </h3>
            {!athlete.assignments || athlete.assignments.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No hay WODs asignados
              </div>
            ) : (
              <div className="space-y-4">
                {athlete.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-lg border p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {assignment.wod.title}
                      </h4>
                    </div>

                    {assignment.wod.description && (
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        {assignment.wod.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {formatDate(assignment.wod.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón flotante volver */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => router.push("/atletas")}
          className="rounded-full bg-primary px-6 py-3 font-medium text-white shadow-lg hover:bg-primary/90"
        >
          ← Volver a Lista
        </button>
      </div>
    </div>
  );
}
