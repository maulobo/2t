"use client";

import React, { useState } from "react";
import { useCreateAthlete } from "@/lib/api/hooks/useAthletes";
import { Athlete } from "@/types/athlete";
import { ACTIVITY_TYPES } from "@/types/fee";

interface CreateAthleteFormProps {
  onSuccess?: (athlete: Athlete) => void;
  onCancel?: () => void;
  coachId?: string; // Opcional, según el schema
}

export default function CreateAthleteForm({
  onSuccess,
  onCancel,
  coachId // Sin valor por defecto, será undefined si no se pasa
}: CreateAthleteFormProps) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    birthDate: "",
    activityType: "", // Tipo de actividad del atleta
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook para crear atleta
  const createAthleteMutation = useCreateAthlete();

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

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const athleteData = {
        // User data
        email: formData.email.trim(),
        password: formData.password.trim(),
        phone: formData.phone.trim() || undefined,
        // AthleteProfile data
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate || undefined,
        activityType: formData.activityType || undefined,
        notes: undefined, // Por ahora no tenemos campo de notas en el form
        coachId: coachId || undefined,
      };

      const newAthlete = await createAthleteMutation.mutateAsync(athleteData);
      
      // Resetear formulario
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        birthDate: "",
        activityType: "",
      });
      
      onSuccess?.(newAthlete);
    } catch (error) {
      console.error("Error creating athlete:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al crear el atleta";
      setErrors({ submit: errorMessage });
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      birthDate: "",
      activityType: "",
    });
    setErrors({});
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errors.submit}
        </div>
      )}

      {/* Nombre completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre completo *
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
          Email *
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

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contraseña *
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Mínimo 6 caracteres"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors.password
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          } dark:bg-gray-800 dark:text-white`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          El atleta usará esta contraseña para ingresar al sistema
        </p>
      </div>

      {/* Teléfono (opcional) */}
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

      {/* Fecha de nacimiento (opcional) */}
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

      {/* Tipo de actividad (opcional) */}
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
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={createAthleteMutation.isPending}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createAthleteMutation.isPending ? "Creando..." : "Crear Atleta"}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={createAthleteMutation.isPending}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}