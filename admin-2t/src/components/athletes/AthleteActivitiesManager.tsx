"use client";

import React, { useState } from "react";
import {
  useAthleteActivities,
  useAssignActivity,
  useUpdateAthleteActivity,
  useUnassignActivity,
  useDeleteAthleteActivity,
} from "@/lib/api/hooks/useActivities";
import { useActiveActivities } from "@/lib/api/hooks/useActivities";
import Badge from "@/components/ui/badge/Badge";
import type { AthleteActivity } from "@/types/athlete";

interface AthleteActivitiesManagerProps {
  athleteId: string;
  athleteName: string;
}

export default function AthleteActivitiesManager({
  athleteId,
  athleteName,
}: AthleteActivitiesManagerProps) {
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Hooks para actividades disponibles
  const { data: availableActivities = [], isLoading: loadingActivities } = useActiveActivities();
  
  // Hooks para actividades del atleta (TODAS: activas e inactivas)
  const { data: athleteActivities = [], isLoading: loadingAthleteActivities } = 
    useAthleteActivities(athleteId);
  
  // Mutations
  const assignMutation = useAssignActivity();
  const updateMutation = useUpdateAthleteActivity();
  const unassignMutation = useUnassignActivity();
  const deleteMutation = useDeleteAthleteActivity();

  const activeActivities = athleteActivities.filter((a: AthleteActivity) => a.isActive) || [];
  const inactiveActivities = athleteActivities.filter((a: AthleteActivity) => !a.isActive) || [];

  // Filtrar actividades disponibles: solo mostrar las que NO tiene el atleta (ni activas ni inactivas)
  const assignedActivityIds = athleteActivities.map((a: AthleteActivity) => a.activityId);
  const availableToAssign = availableActivities.filter(
    activity => !assignedActivityIds.includes(activity.id)
  );

  const handleAddActivity = async () => {
    if (!selectedActivityId) {
      alert("Selecciona una actividad");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        athleteId,
        activityId: selectedActivityId,
        startDate: new Date().toISOString(),
        notes: "",
      });
      setSelectedActivityId("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("❌ Error al agregar actividad. Por favor intenta nuevamente.");
    }
  };

  const handleEndActivity = async (athleteActivity: AthleteActivity) => {
    if (
      !confirm(
        `¿Finalizar ${athleteActivity.activity?.name}?\n\nEl atleta dejará de tener esta actividad activa.`
      )
    ) {
      return;
    }

    try {
      // El backend usa DELETE para finalizar/desasignar
      await unassignMutation.mutateAsync(athleteActivity.id);
    } catch (error) {
      console.error("Error ending activity:", error);
      alert("❌ Error al finalizar actividad");
    }
  };

  const handleReactivate = async (athleteActivity: AthleteActivity) => {
    if (!confirm(`¿Reactivar ${athleteActivity.activity?.name}?`)) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: athleteActivity.id,
        data: {
          endDate: null,
          isActive: true,
        },
      });
    } catch (error) {
      console.error("Error reactivating activity:", error);
      alert("❌ Error al reactivar actividad");
    }
  };

  const handleDelete = async (athleteActivity: AthleteActivity) => {
    if (
      !confirm(
        `¿Eliminar ${athleteActivity.activity?.name} del historial?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ 
        id: athleteActivity.id,
        athleteId: athleteId 
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("❌ Error al eliminar actividad");
    }
  };

  if (loadingActivities || loadingAthleteActivities) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividades de {athleteName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeActivities.length} activa(s) · {inactiveActivities.length}{" "}
            inactiva(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {showAddForm ? "Cancelar" : "+ Agregar Actividad"}
        </button>
      </div>

      {/* Formulario para agregar actividad */}
      {showAddForm && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
            Nueva Actividad
          </h4>
          {availableToAssign.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ✅ El atleta ya tiene todas las actividades disponibles asignadas.
              {inactiveActivities.length > 0 && " Puedes reactivar actividades del historial."}
            </p>
          ) : (
            <div className="flex gap-3">
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar actividad</option>
                {availableToAssign.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddActivity}
                disabled={assignMutation.isPending || !selectedActivityId}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignMutation.isPending ? "Agregando..." : "Agregar"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actividades Activas */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Actividades Activas
        </h4>
        {activeActivities.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No tiene actividades activas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeActivities.map((athleteActivity) => (
              <div
                key={athleteActivity.id}
                className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800"
                style={{
                  backgroundColor: athleteActivity.activity?.color 
                    ? `${athleteActivity.activity.color}10` 
                    : undefined,
                  borderColor: athleteActivity.activity?.color || undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <Badge size="sm" color="success">
                    Activa
                  </Badge>
                  <div>
                    <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                      {athleteActivity.activity?.name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Desde{" "}
                      {new Date(athleteActivity.startDate).toLocaleDateString("es-AR")}
                      {athleteActivity.activity?.price && (
                        <span className="ml-2">
                          • ${athleteActivity.activity.price.toLocaleString("es-AR")}/mes
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEndActivity(athleteActivity)}
                  disabled={updateMutation.isPending}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  Finalizar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial (Inactivas) */}
      {inactiveActivities.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Historial
          </h4>
          <div className="space-y-3">
            {inactiveActivities.map((athleteActivity) => (
              <div
                key={athleteActivity.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <Badge size="sm" color="error">
                    Inactiva
                  </Badge>
                  <div>
                    <p className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                      {athleteActivity.activity?.name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(athleteActivity.startDate).toLocaleDateString("es-AR")}{" "}
                      -{" "}
                      {athleteActivity.endDate
                        ? new Date(athleteActivity.endDate).toLocaleDateString("es-AR")
                        : "Presente"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReactivate(athleteActivity)}
                    disabled={updateMutation.isPending}
                    className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                  >
                    Reactivar
                  </button>
                  <button
                    onClick={() => handleDelete(athleteActivity)}
                    disabled={unassignMutation.isPending}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
