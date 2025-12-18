"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CreateFeeForm from "@/components/fees/CreateFeeForm";
import FeesTable from "@/components/fees/FeesTable";

export default function FeesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateFee = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleFeeCreated = () => {
    setShowCreateModal(false);
    // La tabla se refrescará automáticamente gracias a React Query
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Gestión de Cuotas" />

      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cuotas Mensuales
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestiona los precios de las cuotas mensuales y sus incrementos
              </p>
            </div>

            <button
              onClick={handleCreateFee}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Nueva Cuota
            </button>
          </div>
        </div>

        {/* Tabla de cuotas */}
        <ComponentCard title="Historial de Cuotas">
          <FeesTable />
        </ComponentCard>
      </div>

      {/* Modal para crear cuota */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configurar Nueva Cuota
              </h2>
              <button
                onClick={handleCloseModal}
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
            <CreateFeeForm
              onSuccess={handleFeeCreated}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}