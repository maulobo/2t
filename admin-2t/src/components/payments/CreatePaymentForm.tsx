"use client";

import React, { useState, useEffect } from "react";
import { useAthletes } from "@/lib/api/hooks/useAthletes";
import { useCreatePayment, useApprovePayment } from "@/lib/api/hooks/usePayments";
import { useActiveAthleteActivities } from "@/lib/api/hooks/useAthleteActivities";
import { useActivities } from "@/lib/api/hooks/useActivities";

interface CreatePaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedAthleteId?: string;
}

export default function CreatePaymentForm({
  onSuccess,
  onCancel,
  preselectedAthleteId,
}: CreatePaymentFormProps) {
  const [athleteId, setAthleteId] = useState(preselectedAthleteId || "");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [autoApprove, setAutoApprove] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAthleteList, setShowAthleteList] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Hooks
  const { data: athletesData } = useAthletes({ page: 1, pageSize: 100 });
  
  const createPaymentMutation = useCreatePayment();
  const approvePaymentMutation = useApprovePayment();

  // Obtener actividades activas del atleta seleccionado
  const { data: activeActivities } = useActiveAthleteActivities(
    athleteId,
    !!athleteId
  );

  // Obtener catálogo de actividades para hacer el match con activityId
  const { data: allActivities = [] } = useActivities();

  // Helper: obtener nombre de actividad por ID
  const getActivityName = (activityId: string) => {
    const activity = allActivities.find(a => a.id === activityId);
    return activity?.name || 'Actividad sin nombre';
  };

  // Debug: ver qué datos vienen
  useEffect(() => {
    if (activeActivities && activeActivities.length > 0) {
      console.log('🔍 Actividades del atleta:', activeActivities);
      console.log('🔍 Primera actividad:', activeActivities[0]);
      console.log('🔍 Catálogo de actividades:', allActivities);
    }
  }, [activeActivities, allActivities]);

  // Filtrar atletas por búsqueda
  const filteredAthletes = athletesData?.athletes.filter((athlete) =>
    athlete.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Atleta seleccionado
  const selectedAthlete = athletesData?.athletes.find((a) => a.id === athleteId);

  // Calcular período del mes actual por defecto
  const setCurrentMonthPeriod = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setPeriodStart(firstDay.toISOString().split('T')[0]);
    setPeriodEnd(lastDay.toISOString().split('T')[0]);
  };

  // Calcular próximo mes
  const setNextMonthPeriod = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    setPeriodStart(firstDay.toISOString().split('T')[0]);
    setPeriodEnd(lastDay.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!athleteId || !amount || !periodStart || !periodEnd) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Validar que haya al menos una actividad seleccionada
    if (selectedActivities.length === 0) {
      alert("Por favor selecciona al menos una actividad a pagar");
      return;
    }

    // Validar monto
    const paymentAmount = parseFloat(amount);
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("El monto del pago debe ser mayor a 0");
      return;
    }

    try {
      // IMPORTANTE: Por ahora el backend solo soporta UN activityId por pago
      // Si se seleccionan múltiples actividades, solo guardaremos la primera
      const firstSelectedActivity = selectedActivities[0];
      const firstAthleteActivity = activeActivities?.find(a => a.id === firstSelectedActivity);
      const activityIdToSave = firstAthleteActivity?.activityId;

      // Construir nombres de actividades para las notas (por si se seleccionaron varias)
      const activityNames = selectedActivities
        .map(athleteActivityId => {
          const athleteActivity = activeActivities?.find(a => a.id === athleteActivityId);
          if (!athleteActivity) return null;
          return getActivityName(athleteActivity.activityId);
        })
        .filter(Boolean)
        .join(", ");

      // Preparar datos del pago
      const paymentData = {
        athleteId,
        // Backend multiplica por 100, dividimos aquí para compensar: 10 → 0.1 → backend: 0.1*100=10
        amount: paymentAmount / 100,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        evidenceText: evidenceText || undefined,
        evidenceUrl: evidenceUrl || undefined,
        activityId: activityIdToSave, // ← NUEVO: Guardar el ID de la actividad
      };

      console.log('📤 DEBUG - Datos del pago a enviar:');
      console.log('  - athleteId:', athleteId);
      console.log('  - amount:', paymentAmount);
      console.log('  - activityId:', activityIdToSave);
      console.log('  - Actividad seleccionada (AthleteActivity.id):', firstSelectedActivity);
      console.log('  - Activity real (activityId):', firstAthleteActivity?.activityId);
      console.log('  - Nombre de la actividad:', activityNames);
      console.log('  - Payload completo:', JSON.stringify(paymentData, null, 2));
      
      if (selectedActivities.length > 1) {
        console.warn('⚠️ Se seleccionaron múltiples actividades pero solo se guardará la primera:', activityIdToSave);
      }

      // Crear el pago
      const newPayment = await createPaymentMutation.mutateAsync(paymentData);

      // Si auto-aprobar está activado, aprobar inmediatamente
      if (autoApprove) {
        await approvePaymentMutation.mutateAsync(newPayment.id);
      }

      // Resetear formulario
      setAthleteId(preselectedAthleteId || "");
      setAmount("");
      setPeriodStart("");
      setPeriodEnd("");
      setEvidenceText("");
      setEvidenceUrl("");
      setSearchTerm("");
      setSelectedActivities([]);

      if (onSuccess) {
        onSuccess();
      } else {
        alert(`Pago ${autoApprove ? 'aprobado' : 'creado'} exitosamente!`);
      }
    } catch (error) {
      console.error("Error al crear pago:", error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo crear el pago';
      alert(`Error: ${errorMessage}`);
    }
  };

  const isLoading = createPaymentMutation.isPending || approvePaymentMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda y selección de atleta */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Atleta <span className="text-red-500">*</span>
        </label>

        {selectedAthlete ? (
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedAthlete.fullName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedAthlete.user.email}
              </p>
              {activeActivities && activeActivities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {activeActivities.map((athleteActivity) => (
                    <span
                      key={athleteActivity.id}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {getActivityName(athleteActivity.activityId)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {!preselectedAthleteId && (
              <button
                type="button"
                onClick={() => {
                  setAthleteId("");
                  setSearchTerm("");
                  setSelectedActivities([]);
                }}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Cambiar
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowAthleteList(true);
              }}
              onFocus={() => setShowAthleteList(true)}
              placeholder="Buscar por nombre o email..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

            {/* Lista de atletas filtrados */}
            {showAthleteList && searchTerm && filteredAthletes.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                {filteredAthletes.map((athlete) => (
                  <button
                    key={athlete.id}
                    type="button"
                    onClick={() => {
                      setAthleteId(athlete.id);
                      setSearchTerm("");
                      setShowAthleteList(false);
                    }}
                    className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {athlete.fullName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {athlete.user.email}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {showAthleteList && searchTerm && filteredAthletes.length === 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white p-4 text-center text-gray-500 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                No se encontraron atletas
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actividades a Pagar */}
      {selectedAthlete && activeActivities && activeActivities.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Actividades a Pagar <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-2">
            {activeActivities.map((athleteActivity) => {
              const isSelected = selectedActivities.includes(athleteActivity.id);
              const activityName = getActivityName(athleteActivity.activityId);
              
              return (
                <div
                  key={athleteActivity.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                      : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActivities([...selectedActivities, athleteActivity.id]);
                      } else {
                        setSelectedActivities(selectedActivities.filter(id => id !== athleteActivity.id));
                      }
                    }}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activityName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Activa desde {new Date(athleteActivity.startDate).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones rápidos */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedActivities(activeActivities.map(a => a.id))}
              className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
            >
              Seleccionar todas
            </button>
            <button
              type="button"
              onClick={() => setSelectedActivities([])}
              className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              Deseleccionar todas
            </button>
          </div>
        </div>
      )}

      {/* Mensaje si no hay actividades */}
      {selectedAthlete && (!activeActivities || activeActivities.length === 0) && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Este atleta no tiene actividades asignadas actualmente.
          </p>
        </div>
      )}

      {/* Monto del Pago */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Monto del Pago <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="0.00"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Ingresa el monto total de la cuota mensual
        </p>
      </div>

      {/* Período de Pago */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Período <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={setCurrentMonthPeriod}
              className="text-xs text-primary hover:underline"
            >
              Mes actual
            </button>
            <button
              type="button"
              onClick={setNextMonthPeriod}
              className="text-xs text-primary hover:underline"
            >
              Próximo mes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              Fecha inicio
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              Fecha fin
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Evidencia */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Comprobante (opcional)
        </label>
        <input
          type="text"
          value={evidenceText}
          onChange={(e) => setEvidenceText(e.target.value)}
          placeholder="Ej: Transferencia, Efectivo, Mercado Pago..."
          className="mb-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <input
          type="url"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="URL de imagen/comprobante (opcional)"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Auto-aprobar */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
        <input
          type="checkbox"
          id="autoApprove"
          checked={autoApprove}
          onChange={(e) => setAutoApprove(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="autoApprove" className="flex-1 cursor-pointer">
          <span className="block text-sm font-medium text-gray-900 dark:text-white">
            Aprobar automáticamente
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            El pago se aprobará inmediatamente. Si no, quedará pendiente de aprobación.
          </span>
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Procesando..." : autoApprove ? "Crear y Aprobar" : "Crear Pago"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
