"use client";

import React, { useState } from "react";
import { useUpdateAthlete } from "@/lib/api/hooks/useAthletes";
import { Athlete, UpdateAthleteDto } from "@/types/athlete";
import { ACTIVITY_TYPES } from "@/types/fee";

interface EditAthleteFormProps {
  athlete: Athlete;
  onSuccess?: (athlete: Athlete) => void;
  onCancel?: () => void;
}

export default function EditAthleteForm({
  athlete,
  onSuccess,
  onCancel,
}: EditAthleteFormProps) {
  // Estados del formulario - más campos que en crear
  const [formData, setFormData] = useState({
    fullName: athlete.fullName || "",
    email: athlete.user.email || "",
    phone: athlete.user.phone || "",
    birthDate: athlete.birthDate ? athlete.birthDate.split("T")[0] : "",
    activityType: athlete.activityType || "",
    notes: athlete.notes || "",
    active: athlete.active !== false, // true por defecto
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook para actualizar atleta
  const updateAthleteMutation = useUpdateAthlete();

  // Validación
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (formData.phone && !/^\+?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "El teléfono no es válido";
    }

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 5 || age > 100) {
        newErrors.birthDate = "La edad debe estar entre 5 y 100 años";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Manejar checkbox diferente
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const athleteData: UpdateAthleteDto = {
        // User data
        phone: formData.phone.trim() || undefined,
        // AthleteProfile data
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate || undefined,
        activityType: formData.activityType || undefined,
        notes: formData.notes.trim() || undefined,
        active: formData.active,
      };

      await updateAthleteMutation.mutateAsync({
        id: athlete.id,
        data: athleteData,
      });
      
      onSuccess?.(athlete);
    } catch (error) {
      console.error("Error updating athlete:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el atleta";
      setErrors({ submit: errorMessage });
    }
  };

  const handleCancel = () => {
    // Resetear al estado original
    setFormData({
      fullName: athlete.fullName || "",
      email: athlete.user.email || "",
      phone: athlete.user.phone || "",
      birthDate: athlete.birthDate ? athlete.birthDate.split("T")[0] : "",
      activityType: athlete.activityType || "",
      notes: athlete.notes || "",
      active: athlete.active !== false,
    });
    setErrors({});
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Estado del atleta */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleInputChange}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Atleta activo
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {formData.active ? "(puede acceder al sistema)" : "(acceso bloqueado)"}
          </span>
        </label>
      </div>

      {/* Nombre completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Juan Pérez"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors.fullName
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          } dark:bg-gray-800 dark:text-white`}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="juan@ejemplo.com"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors.email
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          } dark:bg-gray-800 dark:text-white`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Teléfono
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+54 9 11 1234-5678"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors.phone
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          } dark:bg-gray-800 dark:text-white`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
        )}
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Fecha de nacimiento
        </label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors.birthDate
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          } dark:bg-gray-800 dark:text-white`}
        />
        {errors.birthDate && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthDate}</p>
        )}
      </div>

      {/* Tipo de actividad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de actividad
        </label>
        <select
          name="activityType"
          value={formData.activityType}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Seleccionar actividad (opcional)</option>
          {Object.values(ACTIVITY_TYPES).map((activity) => (
            <option key={activity.code} value={activity.code}>
              {activity.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          El tipo de actividad determina la cuota que se aplicará en los pagos
        </p>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notas
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          placeholder="Información adicional sobre el atleta..."
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Lesiones, objetivos, restricciones médicas, etc.
        </p>
      </div>

      {/* Información adicional - solo lectura */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Información del sistema
        </h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>ID del atleta:</span>
            <span className="font-mono text-xs">{athlete.id}</span>
          </div>
          <div className="flex justify-between">
            <span>ID de usuario:</span>
            <span className="font-mono text-xs">{athlete.userId}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha de registro:</span>
            <span>{new Date(athlete.user.createdAt).toLocaleDateString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={updateAthleteMutation.isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateAthleteMutation.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={updateAthleteMutation.isPending}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
