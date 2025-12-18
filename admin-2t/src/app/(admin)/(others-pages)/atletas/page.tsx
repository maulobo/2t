"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AthletesTable from "@/components/tables/AthletesTable";
import Pagination from "@/components/tables/Pagination";
import { useAthletes, useDeleteAthlete } from "@/lib/api/hooks/useAthletes";
import { useApprovePayment, useRejectPayment } from "@/lib/api/hooks/usePayments";
import { Athlete, AthleteListParams } from "@/types/athlete";
import CreatePaymentForm from "@/components/payments/CreatePaymentForm";
import CreateAthleteForm from "@/components/athletes/CreateAthleteForm";

export default function AthletesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedAthleteForPayment, setSelectedAthleteForPayment] = useState<string | null>(null);
 const [showCreateAthleteModal, setShowCreateAthleteModal] = useState(false);
 
 

  // Construir parámetros de la query
  const queryParams: AthleteListParams = {
    page: currentPage,
    pageSize: 10,
    include: 'activities,payments',
    ...(searchTerm && { search: searchTerm }),
  };
 
 

  // Usar el hook personalizado - automáticamente maneja loading, error, cache, revalidación
 const { data, isLoading, error, refetch } = useAthletes(queryParams);

 console.log(data)
 
  
  // Hook para eliminar - maneja automáticamente la revalidación del cache
  const deleteMutation = useDeleteAthlete();
  
  // Hooks para pagos
  const approvePaymentMutation = useApprovePayment();
  const rejectPaymentMutation = useRejectPayment();

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (athleteId: string) => {
    router.push(`/atletas/${athleteId}`);
  };

  const handleEdit = (athlete: Athlete) => {
    // TODO: Implementar edición del atleta
    router.push(`/atletas/${athlete.id}/edit`);
  };

  const handleDelete = async (athleteId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este atleta?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(athleteId);
      alert("Atleta eliminado exitosamente");
    } catch (err) {
      alert("Error al eliminar el atleta");
      console.error("Error deleting athlete:", err);
    }
  };

  const handleCreatePayment = (athleteId: string) => {
    setSelectedAthleteForPayment(athleteId);
  };

  const handleClosePaymentModal = () => {
    setSelectedAthleteForPayment(null);
  };

  const handleCreateAthlete = () => {
    setShowCreateAthleteModal(true);
  };

  const handleCloseAthleteModal = () => {
    setShowCreateAthleteModal(false);
  };

  const handleAthleteCreated = (newAthlete: Athlete) => {
    console.log("Atleta creado:", newAthlete);
    setShowCreateAthleteModal(false);
    // Refrescar la lista
    refetch();
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await approvePaymentMutation.mutateAsync(paymentId);
      alert("Pago aprobado exitosamente");
    } catch (err) {
      alert("Error al aprobar el pago");
      console.error("Error approving payment:", err);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await rejectPaymentMutation.mutateAsync(paymentId);
      alert("Pago rechazado exitosamente");
    } catch (err) {
      alert("Error al rechazar el pago");
      console.error("Error rejecting payment:", err);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Atletas" />

      <div className="space-y-6">
        {/* Filtros y búsqueda */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Búsqueda principal */}
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Buscar atleta por nombre o email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Buscar
              </button>
            </form>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAthleteForPayment("search")}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Abrir formulario para registrar un nuevo pago"
              >
                Agregar Pago
              </button>
              <button
                onClick={handleCreateAthlete}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                + Agregar Atleta
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de atletas */}
        <ComponentCard title="Lista de Atletas">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400">
                {error instanceof Error ? error.message : "Error al cargar los atletas"}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm text-red-600 hover:underline dark:text-red-400"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <AthletesTable
                athletes={data?.athletes || []}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreatePayment={handleCreatePayment}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
              />
              
              {/* Paginación */}
              {data && data.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Contador de resultados */}
              {data && (
                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {data.athletes.length} de {data.total} atletas
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>

      {/* Modal para crear pago */}
      {selectedAthleteForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Registrar Pago
                </h2>
                <button
                  onClick={handleClosePaymentModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <CreatePaymentForm
                preselectedAthleteId={selectedAthleteForPayment === "search" ? undefined : selectedAthleteForPayment || undefined}
                onSuccess={() => {
                  alert("Pago registrado exitosamente!");
                  handleClosePaymentModal();
                }}
                onCancel={handleClosePaymentModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear atleta */}
      {showCreateAthleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Crear Nuevo Atleta
                </h2>
                <button
                  onClick={handleCloseAthleteModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <CreateAthleteForm
                onSuccess={handleAthleteCreated}
                onCancel={handleCloseAthleteModal}
                // coachId se obtendrá del contexto de usuario cuando esté disponible
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
