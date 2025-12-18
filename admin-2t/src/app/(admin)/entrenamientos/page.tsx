"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActiveActivities } from "@/lib/api/hooks/useActivities";
import { useTrainingsByMonth, useCreateTraining, useUpdateTraining, useDeleteTraining } from "@/lib/api/hooks/useTrainings";
import type { Training } from "@/types/athlete";

export default function EntrenamientosManagementPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEntrenamiento, setEditingEntrenamiento] = useState<Training | null>(null);

  // Formato del mes para el hook: "YYYY-MM"
  const monthStr = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentMonth]);

  const { data: entrenamientosData = [], isLoading: loading } = useTrainingsByMonth(monthStr);
  
  // Asegurar que entrenamientos siempre sea un array
  const entrenamientos = useMemo(() => {
    if (Array.isArray(entrenamientosData)) {
      return entrenamientosData;
    }
    console.warn('[Entrenamientos] Data no es array:', entrenamientosData);
    return [];
  }, [entrenamientosData]);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    if (!user?.id) {
      alert("Error: No se pudo identificar el usuario. Por favor, recarga la página.");
      return;
    }
    setSelectedDate(date);
    setEditingEntrenamiento(null); // Limpiar edición
    setShowCreateModal(true);
  };

  const handleEntrenamientoClick = (e: React.MouseEvent, entrenamiento: Training) => {
    e.stopPropagation(); // Evitar que se active el click del día
    if (!user?.id) {
      alert("Error: No se pudo identificar el usuario. Por favor, recarga la página.");
      return;
    }
    setEditingEntrenamiento(entrenamiento);
    setSelectedDate(new Date(entrenamiento.date));
    setShowCreateModal(true);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEntrenamientosForDate = (date: Date | null) => {
    if (!date) return [];
    if (!Array.isArray(entrenamientos)) return [];
    const dateStr = date.toISOString().split('T')[0];
    return entrenamientos.filter(entrenamiento => entrenamiento.date.startsWith(dateStr));
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Entrenamientos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra los entrenamientos del mes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          + Crear Entrenamiento
        </button>
      </div>

      {/* Calendario */}
      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
        {/* Controles del mes */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Navegación con flechas */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Mes anterior"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Mes siguiente"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Selectores de mes y año */}
          <div className="flex gap-2">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-2">
          {/* Headers de días */}
          {dayNames.map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
              {day}
            </div>
          ))}

          {/* Días del mes */}
          {loading ? (
            <div className="col-span-7 py-20 text-center text-gray-500">
              Cargando calendario...
            </div>
          ) : (
            getDaysInMonth().map((date, index) => {
              const entrenamientosForDay = getEntrenamientosForDate(date);
              const isToday = date && 
                date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  onClick={() => date && handleDateClick(date)}
                  className={`min-h-24 rounded-lg border p-2 transition-colors ${
                    date
                      ? "cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      : ""
                  } ${
                    isToday
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium ${
                        isToday ? "text-brand-600 dark:text-brand-400" : "text-gray-900 dark:text-white"
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {entrenamientosForDay.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {entrenamientosForDay.map(entrenamiento => {
                            const activityColor = entrenamiento.activity?.color || "#3B82F6";
                            return (
                              <div
                                key={entrenamiento.id}
                                onClick={(e) => handleEntrenamientoClick(e, entrenamiento)}
                                className="group truncate rounded px-1 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
                                style={{
                                  backgroundColor: `${activityColor}20`,
                                  color: activityColor,
                                  borderLeft: `3px solid ${activityColor}`,
                                }}
                                title={`${entrenamiento.activity?.name || "Sin actividad"}: ${entrenamiento.title}`}
                              >
                                {entrenamiento.title}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Leyenda */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-brand-500"></div>
              <span>Día actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-l-4 border-blue-500 bg-blue-500/20"></div>
              <span>Tiene entrenamiento</span>
            </div>
          </div>
          
          {/* Leyenda de actividades */}
          {entrenamientos.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Actividades del mes
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(entrenamientos.map(e => e.activityId).filter(Boolean))).map(activityId => {
                  const entrenamiento = entrenamientos.find(e => e.activityId === activityId);
                  const activity = entrenamiento?.activity;
                  if (!activity) return null;
                  
                  return (
                    <div
                      key={activityId}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${activity.color}20`,
                        color: activity.color,
                        borderLeft: `3px solid ${activity.color}`,
                      }}
                    >
                      <span>{activity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Entrenamiento */}
      {showCreateModal && user?.id && (
        <CreateEntrenamientoModal
          date={selectedDate}
          editingEntrenamiento={editingEntrenamiento}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
            setEditingEntrenamiento(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
            setEditingEntrenamiento(null);
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}

// Modal para crear/editar Entrenamiento
function CreateEntrenamientoModal({
  date,
  editingEntrenamiento,
  onClose,
  onSuccess,
  userId,
}: {
  date: Date | null;
  editingEntrenamiento: Training | null;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}) {
  const { data: actividades = [], isLoading: loadingActividades } = useActiveActivities();
  const createMutation = useCreateTraining();
  const updateMutation = useUpdateTraining();
  const deleteMutation = useDeleteTraining();
  
  const [formData, setFormData] = useState({
    title: editingEntrenamiento?.title || "",
    description: editingEntrenamiento?.description || "",
    date: editingEntrenamiento 
      ? editingEntrenamiento.date.split('T')[0] 
      : date 
        ? date.toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
    videoUrl: editingEntrenamiento?.videoUrl || "",
    activityId: editingEntrenamiento?.activityId || "",
  });
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const loading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar que tenemos userId
    if (!userId) {
      setError("Error: No se pudo identificar el usuario. Por favor, recarga la página.");
      return;
    }

    try {
      // Convertir la fecha a ISO con hora local (mediodía para evitar problemas de zona horaria)
      const [year, month, day] = formData.date.split('-');
      const dateWithTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      const isoDate = dateWithTime.toISOString();

      const payload = {
        title: formData.title,
        description: formData.description,
        date: isoDate,
        videoUrl: formData.videoUrl || "",
        activityId: formData.activityId || undefined,
        createdById: userId,
      };

      console.log('[Admin Entrenamiento] Payload:', payload);
      console.log('[Admin Entrenamiento] userId:', userId);

      if (editingEntrenamiento) {
        // Editar entrenamiento existente
        await updateMutation.mutateAsync({
          id: editingEntrenamiento.id,
          data: payload,
        });
      } else {
        // Crear nuevo entrenamiento
        await createMutation.mutateAsync(payload);
      }

      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      setError(error.response?.data?.message || "Error al guardar entrenamiento");
    }
  };

  const handleDelete = async () => {
    if (!editingEntrenamiento) return;
    
    try {
      await deleteMutation.mutateAsync(editingEntrenamiento.id);
      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      setError(error.response?.data?.message || "Error al eliminar el entrenamiento");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingEntrenamiento ? "Editar Entrenamiento" : "Crear Entrenamiento"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Título
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="ej: Fran, Murph, Strength Day..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Actividad *
              </label>
              <select
                required
                value={formData.activityId}
                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                disabled={loadingActividades}
              >
                <option value="">Selecciona una actividad</option>
                {actividades.map((actividad) => (
                  <option key={actividad.id} value={actividad.id}>
                    {actividad.icon} {actividad.name}
                  </option>
                ))}
              </select>
              {loadingActividades && (
                <p className="mt-1 text-xs text-gray-500">Cargando actividades...</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              required
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="21-15-9&#10;Thrusters (95/65 lb)&#10;Pull-ups"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video de YouTube (opcional)
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Pega el enlace completo de YouTube para mostrar el video a los atletas
            </p>
          </div>

          <div className="flex gap-3">
            {editingEntrenamiento && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              {loading ? (editingEntrenamiento ? "Guardando..." : "Creando...") : (editingEntrenamiento ? "Guardar Cambios" : "Crear Entrenamiento")}
            </button>
          </div>
        </form>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                ¿Eliminar Entrenamiento?
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                ¿Estás seguro de que quieres eliminar &quot;{editingEntrenamiento?.title}&quot;? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 "
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
