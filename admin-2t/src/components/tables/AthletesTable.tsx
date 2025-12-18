"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Athlete, Payment, AthleteActivity, Activity } from "@/types/athlete";
import { useAthletePayments } from "@/lib/api";
import { useActiveAthleteActivities, useActivities } from "@/lib/api/hooks/useActivities";

interface AthletesTableProps {
  athletes: Athlete[];
  onEdit?: (athlete: Athlete) => void;
  onDelete?: (athleteId: string) => void;
  onViewDetails?: (athleteId: string) => void;
  onCreatePayment?: (athleteId: string) => void;
  onApprovePayment?: (paymentId: string) => void;
  onRejectPayment?: (paymentId: string) => void;
}

function AthleteActivitiesCell({ athleteId, athlete }: { athleteId: string; athlete: Athlete }) {
  const { data: athleteActivitiesData = [], isLoading: loadingActivities } = useActiveAthleteActivities(athleteId);
  const { data: payments = [], isLoading: loadingPayments } = useAthletePayments(athleteId);
  const { data: allActivities = [] } = useActivities();

  // Allow using pre-loaded activities from athlete prop when available
  const athleteActivities: AthleteActivity[] = (athlete && Array.isArray(athlete.activities) && athlete.activities.length > 0)
    ? (athlete.activities as AthleteActivity[]).filter(a => a.isActive)
    : (athleteActivitiesData as AthleteActivity[]);

  const now = new Date();
  const validPayments: Payment[] = (payments || []).filter((p: Payment) => p.status === 'APPROVED' && new Date(p.periodEnd) >= now);
  const hasGlobal = validPayments.some((p: Payment) => !p.activityId);
  const paidIds = new Set(validPayments.filter((p: Payment) => p.activityId).map((p: Payment) => p.activityId as string));

  const total = athleteActivities?.length || 0;
  const paidCount = hasGlobal ? total : athleteActivities.filter((a: AthleteActivity) => paidIds.has(a.activityId)).length;

  if (total === 0) {
    return <span className="text-sm text-gray-400">Sin actividades</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1">
        <span className={`font-medium ${
          paidCount === total ? 'text-green-600 dark:text-green-400' :
          paidCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'
        }`}
        >
          {paidCount}/{total}
        </span>
      </div>

      {athleteActivities.slice(0, 3).map((a: AthleteActivity) => {
        const activityId = a.activityId;
        const name = a.activity?.name ?? (allActivities as Activity[]).find((x: Activity) => x.id === activityId)?.name ?? 'Actividad';
        const paid = hasGlobal || (activityId && paidIds.has(activityId));

        return (
          <div key={a.id} className="flex items-center gap-2 text-sm">
            <span className="text-sm text-gray-400">{name}</span>
            <span className={`text-xs ${a.isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {a.isActive ? 'Activa' : 'Inactiva'}
            </span>
            <span className={`text-xs font-semibold ${paid ? 'text-green-600' : 'text-red-600'}`}>
              {paid ? 'Pagada' : 'No pagada'}
            </span>
          </div>
        );
      })}

      {athleteActivities.length > 3 && (
        <div className="text-xs text-gray-400">+{athleteActivities.length - 3} más</div>
      )}
    </div>
  );
}

export default function AthletesTable({
  athletes,
  onDelete,
  onViewDetails,
  onCreatePayment,
  onApprovePayment,
  onRejectPayment,
}: AthletesTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<{
    payment: Payment;
    athlete: Athlete;
  } | null>(null);
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Formatear monto sin decimales
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
console.log(athletes)
  /**
   * Obtener el último pago aprobado del atleta
   */
  const getLastApprovedPayment = (payments: Payment[]): Payment | null => {
    const approvedPayments = payments
      .filter((p) => p.status === "APPROVED")
      .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
    
    return approvedPayments[0] || null;
  };

  /**
   * Obtener pagos pendientes del atleta
   */
  const getPendingPayments = (payments: Payment[]): Payment[] => {
    return payments
      .filter((p) => p.status === "PENDING")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  /**
   * Calcular días hasta el vencimiento del pago
   */
  const getDaysUntilExpiry = (periodEnd: string): number => {
    const today = new Date();
    const endDate = new Date(periodEnd);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Calcular actividades pagadas vs totales
   */
  const getPaidActivitiesInfo = (athlete: Athlete) => {
    // Actividades en las que está inscrito (activas)
   // Soportar tanto 'activities' como 'athleteActivities' por si el backend varía
   const activities = (athlete.activities as AthleteActivity[]) || ((athlete as any).athleteActivities as AthleteActivity[]) || [];

    const enrolledActivities = activities.filter((a: AthleteActivity) => a.isActive) || [];
    
    if (enrolledActivities.length === 0) return { paid: 0, total: 0 };

    // Pagos válidos (Aprobados y no vencidos)
    const validPayments = athlete.payments?.filter(p => {
      if (p.status !== 'APPROVED') return false;
      const endDate = new Date(p.periodEnd);
      const today = new Date();
      // Normalizar fechas para comparar solo día/mes/año si es necesario, 
      // pero new Date() incluye hora, así que mejor comparar timestamps o setear horas a 0
      // Aquí usamos la lógica simple: si la fecha de fin es mayor o igual a ahora.
      return endDate >= today;
    }) || [];

    // Si hay algún pago válido que no tenga activityId (pago global/legacy), asumimos que paga todo
    const hasGlobalPayment = validPayments.some(p => !p.activityId);
    if (hasGlobalPayment) {
      return { paid: enrolledActivities.length, total: enrolledActivities.length };
    }

    // Contar cuántas actividades inscritas tienen un pago válido asociado
    let paidCount = 0;
    enrolledActivities.forEach((activity: AthleteActivity) => {
      // Buscamos si hay un pago para esta actividad
      // activity.activityId es el ID de la actividad en el catálogo
      const isPaid = validPayments.some((p: Payment) => p.activityId === activity.activityId);
      if (isPaid) paidCount++;
    });

    return { paid: paidCount, total: enrolledActivities.length };
  };

  /**
   * Obtener badge de estado de pago
   */
  const getPaymentStatusBadge = (athlete: Athlete) => {
    const pendingPayments = getPendingPayments(athlete.payments);

    // Priorizar pagos pendientes - mostrar el más reciente
    if (pendingPayments.length > 0) {
      const latestPending = pendingPayments[0];
      const createdDate = formatDate(latestPending.createdAt);
      
      return (
        <div className="flex flex-col items-start">
          <button
            onClick={() => setSelectedPayment({ payment: latestPending, athlete })}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            title="Click para gestionar pago pendiente"
          >
            <Badge size="sm" color="warning">
              Pendiente
            </Badge>
          </button>
          <span className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            {formatAmount(latestPending.amount)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Creado: {createdDate}
          </span>
          {pendingPayments.length > 1 && (
            <span className="text-xs text-yellow-500 dark:text-yellow-400">
              +{pendingPayments.length - 1} más pendiente{pendingPayments.length > 2 ? 's' : ''}
            </span>
          )}
        </div>
      );
    }

    // Si no hay pendientes, verificar el último pago aprobado
    const lastPayment = getLastApprovedPayment(athlete.payments);

    if (!lastPayment) {
      return (
        <div className="flex flex-col items-start">
          <Badge size="sm" color="error">
            Sin pagos
          </Badge>
          <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            No hay pagos registrados
          </span>
        </div>
      );
    }

    const daysUntilExpiry = getDaysUntilExpiry(lastPayment.periodEnd);
    const lastPaymentDate = formatDate(lastPayment.periodEnd);

    // Vencido
    if (daysUntilExpiry < 0) {
      return (
        <div className="flex flex-col items-start">
          <Badge size="sm" color="error">
            Vencido
          </Badge>
          <span className="mt-1 text-xs text-red-500 dark:text-red-400">
            Hace {Math.abs(daysUntilExpiry)} días
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Último: {lastPaymentDate}
          </span>
        </div>
      );
    }

    // Por vencer (menos de 7 días)
    if (daysUntilExpiry <= 7) {
      return (
        <div className="flex flex-col items-start">
          <Badge size="sm" color="warning">
            Por vencer
          </Badge>
          <span className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            Faltan {daysUntilExpiry} {daysUntilExpiry === 1 ? "día" : "días"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Vence: {lastPaymentDate}
          </span>
        </div>
      );
    }

    // Al día (más de 7 días)
    return (
      <div className="flex flex-col items-start">
        <Badge size="sm" color="success">
          Al día
        </Badge>
        <span className="mt-1 text-xs text-green-600 dark:text-green-400">
          Faltan {daysUntilExpiry} días
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Vence: {lastPaymentDate}
        </span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">

          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Atleta
                </TableCell>

                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Contacto
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actividades
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estado de Pago
                </TableCell>

                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {athletes.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron atletas
                  </td>
                </TableRow>
              ) : (
                athletes.map((athlete) => (
                  <TableRow key={athlete.id}>
                    {/* Atleta Info */}
                    <TableCell className="px-3 py-3 text-start">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {athlete.fullName}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {athlete.user.email}
                        </span>
                      </div>
                    </TableCell>


                    {/* Contacto */}
                    <TableCell className="px-3 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {athlete.user.phone || "Sin teléfono"}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="px-3 py-3 text-start">
                      <Badge
                        size="sm"
                        color={athlete.active ? "success" : "error"}
                      >
                        {athlete.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>

                    {/* Actividades Pagadas + Detalle */}
                    <TableCell className="px-3 py-3 text-start">
                      <div>
                        <AthleteActivitiesCell athleteId={athlete.id} athlete={athlete} />
                      </div>
                    </TableCell>

                    {/* Estado de Pago */}
                    <TableCell className="px-3 py-3 text-start">
                      {getPaymentStatusBadge(athlete)}
                    </TableCell>



                    {/* Acciones */}
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {onCreatePayment && (
                          <button
                            onClick={() => onCreatePayment(athlete.id)}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            title="Registrar pago"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(athlete.id)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalles"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        )}
                        {/* {onEdit && (
                          <button
                            onClick={() => onEdit(athlete)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )} */}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(athlete.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

      </div>

      {/* Modal para gestionar pago pendiente */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gestionar Pago Pendiente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Atleta: {selectedPayment.athlete.fullName}
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monto:</span>
                  <span className="font-medium">{formatAmount(selectedPayment.payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Período:</span>
                  <span className="text-sm">
                    {formatDate(selectedPayment.payment.periodStart)} - {formatDate(selectedPayment.payment.periodEnd)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Creado:</span>
                  <span className="text-sm">{formatDate(selectedPayment.payment.createdAt)}</span>
                </div>
                {selectedPayment.payment.evidenceText && (
                  <div className="pt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Evidencia:</span>
                    <p className="text-sm mt-1">{selectedPayment.payment.evidenceText}</p>
                  </div>
                )}
                {selectedPayment.payment.evidenceUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedPayment.payment.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver comprobante
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (onApprovePayment) {
                    onApprovePayment(selectedPayment.payment.id);
                  }
                  setSelectedPayment(null);
                }}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aprobar Pago
              </button>
              <button
                onClick={() => {
                  if (onRejectPayment) {
                    onRejectPayment(selectedPayment.payment.id);
                  }
                  setSelectedPayment(null);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
