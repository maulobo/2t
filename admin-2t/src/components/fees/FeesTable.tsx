"use client";

import React from "react";
import { useFees, useDeleteFee, useActivateFee } from "@/lib/api/hooks/useFees";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Fee } from "@/types/fee";

export default function FeesTable() {
 const { data, isLoading, error, refetch } = useFees();
 console.log(data)
  const deleteMutation = useDeleteFee();
  const activateMutation = useActivateFee();

  const handleDelete = async (feeId: string) => {
    // Buscar la cuota para verificar si está activa
    const fee = data?.find((f) => f.id === feeId);
    
    if (fee?.isActive) {
      alert("⚠️ No puedes eliminar una cuota activa.\n\nPara eliminarla:\n1. Activa otra cuota primero\n2. Luego elimina esta");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar esta cuota?\n\nEsta acción no se puede deshacer.")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(feeId);
      alert("✅ Cuota eliminada exitosamente");
    } catch (err) {
      alert("❌ Error al eliminar la cuota.\n\nPuede que esté siendo utilizada en pagos existentes.");
      console.error("Error deleting fee:", err);
    }
  };

  const handleActivate = async (feeId: string) => {
    const fee = data?.find((f) => f.id === feeId);
    const activeFee = data?.find((f) => f.isActive && f.activityType === fee?.activityType);
    
    let message = `¿Activar esta cuota de ${fee?.activityName}?`;
    if (activeFee) {
      message += `\n\nLa cuota anterior de ${activeFee.activityName} se desactivará automáticamente.`;
    }
    message += `\n\n⚠️ IMPORTANTE: Solo se desactivará la cuota del mismo tipo de actividad (${fee?.activityName}). Las cuotas de otras actividades permanecerán activas.`;
    
    if (!confirm(message)) {
      return;
    }

    try {
      await activateMutation.mutateAsync(feeId);
      
      // Verificar si el backend pisó otras cuotas
      setTimeout(() => {
        refetch();
        const updatedData = data;
        const otherActiveFeesCount = updatedData?.filter(
          (f) => f.isActive && f.activityType !== fee?.activityType
        ).length || 0;
        
        alert(`✅ Cuota de ${fee?.activityName} activada exitosamente\n\n📊 Tienes ${otherActiveFeesCount} cuotas activas de otras actividades.`);
      }, 500);
    } catch (err) {
      alert("❌ Error al activar la cuota");
      console.error("Error activating fee:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number, currency: string = "ARS") => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (fee: Fee) => {
    if (fee.isActive) {
      return <Badge size="sm" color="success">Vigente</Badge>;
    }
    
    const now = new Date();
    const validFrom = new Date(fee.validFrom);
    const validUntil = fee.validUntil ? new Date(fee.validUntil) : null;

    if (validFrom > now) {
      return <Badge size="sm" color="warning">Programada</Badge>;
    }

    if (validUntil && validUntil < now) {
      return <Badge size="sm" color="error">Expirada</Badge>;
    }

    return <Badge size="sm" color="error">Inactiva</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-400">
          Error al cargar las cuotas
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-600 hover:underline dark:text-red-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // El backend devuelve un array directo, no un objeto con fees
  const fees = data || [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Estado
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tipo de Actividad
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Monto
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Vigencia
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Descripción
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {fees.length === 0 ? (
              <TableRow>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No hay cuotas configuradas
                </td>
              </TableRow>
            ) : (
              fees.map((fee) => (
                <TableRow key={fee.id}>
                  {/* Estado */}
                  <TableCell className="px-5 py-4 text-start">
                    {getStatusBadge(fee)}
                  </TableCell>

                  {/* Tipo de Actividad */}
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {fee.activityName}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {fee.activityType}
                      </div>
                    </div>
                  </TableCell>

                  {/* Monto */}
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(fee.amount, fee.currency)}
                    </span>
                  </TableCell>

                  {/* Vigencia */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        Desde: {formatDate(fee.validFrom)}
                      </div>
                      {fee.validUntil && (
                        <div className="text-gray-500 dark:text-gray-400">
                          Hasta: {formatDate(fee.validUntil)}
                        </div>
                      )}
                      {!fee.validUntil && fee.isActive && (
                        <div className="text-green-600 dark:text-green-400">
                          Sin fecha fin
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Descripción */}
                  <TableCell className="px-5 py-4 text-start">
                    <span className="text-gray-700 dark:text-gray-300">
                      {fee.description || "Sin descripción"}
                    </span>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {!fee.isActive && (
                        <button
                          onClick={() => handleActivate(fee.id)}
                          className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Activar cuota"
                          disabled={activateMutation.isPending}
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(fee.id)}
                        className={`${
                          fee.isActive
                            ? "text-gray-300 cursor-not-allowed dark:text-gray-600"
                            : "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        }`}
                        title={
                          fee.isActive
                            ? "No se puede eliminar una cuota activa. Desactívala primero activando otra cuota."
                            : "Eliminar cuota"
                        }
                        disabled={deleteMutation.isPending || fee.isActive}
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}