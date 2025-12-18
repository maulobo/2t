"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AthleteActivitiesManager from "@/components/athletes/AthleteActivitiesManager";
import { useAthlete } from "@/lib/api/hooks/useAthletes";
import { useAthletePayments } from "@/lib/api/hooks/usePayments";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AthleteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  const { data: athlete, isLoading, error } = useAthlete(athleteId);
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

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      BEGINNER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      INTERMEDIATE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      ADVANCED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      RX: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    const labels = {
      BEGINNER: "Principiante",
      INTERMEDIATE: "Intermedio",
      ADVANCED: "Avanzado",
      RX: "RX",
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badges[difficulty as keyof typeof badges]}`}>
        {labels[difficulty as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={athlete.fullName} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Información Personal */}
        <div className="lg:col-span-1">
          <ComponentCard title="Información Personal">
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white">
                  {athlete.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Estado */}
              <div className="text-center">
                <span
                  className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${
                    athlete.active
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {athlete.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Datos */}
              <div className="space-y-3 border-t pt-4 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {athlete.user.email}
                  </p>
                </div>

                {athlete.user.phone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {athlete.user.phone}
                    </p>
                  </div>
                )}

                {athlete.birthDate && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fecha de Nacimiento
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(athlete.birthDate)}
                    </p>
                  </div>
                )}

                {athlete.notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notas</p>
                    <p className="text-gray-900 dark:text-white">{athlete.notes}</p>
                  </div>
                )}

                {athlete.coach && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Coach</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {athlete.coach.user.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {athlete._count?.payments || athlete.payments.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pagos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {athlete._count?.assignments || athlete.assignments?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">WODs</p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2 border-t pt-4 dark:border-gray-700">
                <button
                  onClick={() => router.push(`/atletas/${athlete.id}/edit`)}
                  className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  Editar Atleta
                </button>
                <button
                  onClick={() => router.push("/atletas")}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Volver a Lista
                </button>
              </div>
            </div>
          </ComponentCard>

          {/* Actividades del Atleta */}
          <ComponentCard title="Actividades">
            <AthleteActivitiesManager
              athleteId={athlete.id}
              athleteName={athlete.fullName}
            />
          </ComponentCard>
        </div>

        {/* Historial de Pagos y WODs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Historial de Pagos */}
          <ComponentCard title="Historial de Pagos">
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
                        Evidencia
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
                          {payment.evidenceText && (
                            <div className="max-w-32 truncate" title={payment.evidenceText}>
                              {payment.evidenceText}
                            </div>
                          )}
                          {payment.evidenceUrl && (
                            <a
                              href={payment.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-xs"
                            >
                              Ver comprobante
                            </a>
                          )}
                          {!payment.evidenceText && !payment.evidenceUrl && (
                            <span className="text-gray-400">Sin evidencia</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ComponentCard>

          {/* WODs Asignados */}
          <ComponentCard title="WODs Asignados">
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assignment.wod.name}
                          </h3>
                          {getDifficultyBadge(assignment.wod.difficulty)}
                          {assignment.completedAt && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-300">
                              Completado
                            </span>
                          )}
                        </div>

                        {assignment.wod.description && (
                          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                            {assignment.wod.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            📅 Fecha: {formatDate(assignment.wod.date)}
                          </span>
                          {assignment.wod.duration && (
                            <span>Duración: {assignment.wod.duration} min</span>
                          )}
                          <span>
                            🔔 Asignado: {formatDate(assignment.assignedAt)}
                          </span>
                        </div>

                        {assignment.notes && (
                          <div className="mt-2 rounded bg-yellow-50 p-2 dark:bg-yellow-900/20">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {assignment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
