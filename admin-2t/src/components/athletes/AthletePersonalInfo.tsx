"use client";

import React, { useState } from "react";
import type { Athlete, UpdateAthleteDto } from "@/types/athlete";
import { useUpdateAthlete } from "@/lib/api/hooks/useAthletes";
import { format } from "date-fns";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSection,
  InfoField,
  InfoFieldText,
} from "./FormComponents";

interface AthletePersonalInfoProps {
  athlete: Athlete;
}

export default function AthletePersonalInfo({ athlete }: AthletePersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateAthleteDto>({
    fullName: athlete.fullName,
    birthDate: athlete.birthDate || "",
    height: athlete.height || undefined,
    gender: athlete.gender || "",
    bloodType: athlete.bloodType || "",
    city: athlete.city || "",
    province: athlete.province || "",
    country: athlete.country || "Argentina",
    emergencyContactName: athlete.emergencyContactName || "",
    emergencyContactPhone: athlete.emergencyContactPhone || "",
    goals: athlete.goals || "",
    injuries: athlete.injuries || "",
    medications: athlete.medications || "",
    notes: athlete.notes || "",
  });

  const updateMutation = useUpdateAthlete();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: athlete.id,
        data: formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error actualizando atleta:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  if (!isEditing) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Información Personal
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
             Editar
          </button>
        </div>

        {/* Avatar y estado */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white">
            {athlete.fullName.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
            {athlete.fullName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{athlete.user.email}</p>
          <div className="mt-2">
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
        </div>

        {/* Información básica */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Teléfono" value={athlete.user.phone} />
            <InfoField
              label="Fecha de Nacimiento"
              value={
                athlete.birthDate
                  ? format(new Date(athlete.birthDate), "dd/MM/yyyy")
                  : null
              }
            />
            <InfoField label="Altura" value={athlete.height ? `${athlete.height} cm` : null} />
            <InfoField label="Género" value={translateGender(athlete.gender)} />
            <InfoField label="Tipo de Sangre" value={athlete.bloodType} />
          </div>

          {/* Ubicación */}
          {(athlete.city || athlete.province || athlete.country) && (
            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-white"> Ubicación</h4>
              <div className="grid grid-cols-3 gap-4">
                <InfoField label="Ciudad" value={athlete.city} />
                <InfoField label="Provincia" value={athlete.province} />
                <InfoField label="País" value={athlete.country} />
              </div>
            </div>
          )}

          {/* Contacto de emergencia */}
          {(athlete.emergencyContactName || athlete.emergencyContactPhone) && (
            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                Contacto de Emergencia
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Nombre" value={athlete.emergencyContactName} />
                <InfoField label="Teléfono" value={athlete.emergencyContactPhone} />
              </div>
            </div>
          )}

          {/* Objetivos y salud */}
          <div className="border-t pt-4 dark:border-gray-700">
            <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">Objetivos y Salud</h4>
            <div className="space-y-3">
              {athlete.goals && <InfoFieldText label="Objetivos" value={athlete.goals} />}
              {athlete.injuries && (
                <InfoFieldText label="Historial de Lesiones" value={athlete.injuries} />
              )}
              {athlete.medications && (
                <InfoFieldText label="Medicaciones" value={athlete.medications} />
              )}
              {athlete.notes && <InfoFieldText label="Notas" value={athlete.notes} />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo edición
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Editar Información Personal
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nombre Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {/* Teléfono no se puede editar aquí - pertenece a User */}
            <FormInput
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              value={formData.birthDate?.split('T')[0]}
              onChange={handleChange}
            />
            <FormInput
              label="Altura (cm)"
              name="height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={handleChange}
            />
            <FormSelect
              label="Género"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: "MALE", label: "Masculino" },
                { value: "FEMALE", label: "Femenino" },
                { value: "OTHER", label: "Otro" },
              ]}
            />
            <FormSelect
              label="Tipo de Sangre"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />
          </div>
        </div>

        {/* Ubicación */}
        <FormSection title="Ubicación" icon="📍">
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <FormInput
              label="Provincia"
              name="province"
              value={formData.province}
              onChange={handleChange}
            />
            <FormInput
              label="País"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Contacto de emergencia */}
        <FormSection title="Contacto de Emergencia">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nombre"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
            />
            <FormInput
              label="Teléfono"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Objetivos y salud */}
        <FormSection title="Objetivos y Salud" >
          <div className="space-y-4">
            <FormTextarea
              label="Objetivos Personales"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: Mejorar fuerza, perder peso, competir..."
            />
            <FormTextarea
              label="Historial de Lesiones"
              name="injuries"
              value={formData.injuries}
              onChange={handleChange}
              rows={3}
              placeholder="Lesiones previas o actuales..."
            />
            <FormTextarea
              label="Medicaciones Actuales"
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              rows={2}
              placeholder="Medicamentos que toma actualmente..."
            />
            <FormTextarea
              label="Notas Generales"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Notas adicionales sobre el atleta..."
            />
          </div>
        </FormSection>

        {/* Botones */}
        <div className="flex gap-3 border-t pt-4 dark:border-gray-700">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Guardando..." : "💾 Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ❌ Cancelar
          </button>
        </div>

        {updateMutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            Error al actualizar el perfil. Por favor intenta nuevamente.
          </div>
        )}
      </form>
    </div>
  );
}

function translateGender(gender: string | null): string {
  if (!gender) return "-";
  const translations: Record<string, string> = {
    MALE: "Masculino",
    FEMALE: "Femenino",
    OTHER: "Otro",
  };
  return translations[gender] || gender;
}
