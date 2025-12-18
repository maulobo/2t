"use client";

import { useState, useEffect } from "react";
import { useCreateMetric, useUpdateMetric, useAthleteMetrics } from "@/hooks/useAthleteMetrics";
import { CustomMetricsManager } from "./CustomMetricsManager";
import type { CreateAthleteMetricDto, UpdateAthleteMetricDto } from "@/types/athlete";

interface MetricFormProps {
  athleteId: string;
  metricId?: string | null;
  onClose: () => void;
}

export function MetricForm({ athleteId, metricId, onClose }: MetricFormProps) {
  const createMetric = useCreateMetric();
  const updateMetric = useUpdateMetric();
  const { data: metrics } = useAthleteMetrics(athleteId);

  const existingMetric = metricId
    ? metrics?.find((m) => m.id === metricId)
    : null;

  const [formData, setFormData] = useState<Partial<CreateAthleteMetricDto>>({
    athleteId,
    date: new Date().toISOString().split("T")[0],
    weight: undefined,
    bodyFatPercent: undefined,
    muscleMass: undefined,
    bmi: undefined,
    waist: undefined,
    hip: undefined,
    chest: undefined,
    rightArm: undefined,
    leftArm: undefined,
    rightThigh: undefined,
    leftThigh: undefined,
    backSquat: undefined,
    frontSquat: undefined,
    deadlift: undefined,
    benchPress: undefined,
    shoulderPress: undefined,
    cleanAndJerk: undefined,
    snatch: undefined,
    franTime: undefined,
    murphTime: undefined,
    cindyRounds: undefined,
    graceTime: undefined,
    helenTime: undefined,
    maxPullUps: undefined,
    maxPushUps: undefined,
    plankTime: undefined,
    customMetrics: {},
    notes: "",
  });

  const [activeSection, setActiveSection] = useState<
    "body" | "perimeters" | "lifts" | "benchmarks" | "other" | "custom"
  >("body");

  useEffect(() => {
    if (existingMetric) {
      const convertNullToUndefined = (value: number | null | undefined) =>
        value === null ? undefined : value;

      setFormData({
        athleteId,
        date: new Date(existingMetric.date).toISOString().split("T")[0],
        weight: convertNullToUndefined(existingMetric.weight),
        bodyFatPercent: convertNullToUndefined(existingMetric.bodyFatPercent),
        muscleMass: convertNullToUndefined(existingMetric.muscleMass),
        bmi: convertNullToUndefined(existingMetric.bmi),
        waist: convertNullToUndefined(existingMetric.waist),
        hip: convertNullToUndefined(existingMetric.hip),
        chest: convertNullToUndefined(existingMetric.chest),
        rightArm: convertNullToUndefined(existingMetric.rightArm),
        leftArm: convertNullToUndefined(existingMetric.leftArm),
        rightThigh: convertNullToUndefined(existingMetric.rightThigh),
        leftThigh: convertNullToUndefined(existingMetric.leftThigh),
        backSquat: convertNullToUndefined(existingMetric.backSquat),
        frontSquat: convertNullToUndefined(existingMetric.frontSquat),
        deadlift: convertNullToUndefined(existingMetric.deadlift),
        benchPress: convertNullToUndefined(existingMetric.benchPress),
        shoulderPress: convertNullToUndefined(existingMetric.shoulderPress),
        cleanAndJerk: convertNullToUndefined(existingMetric.cleanAndJerk),
        snatch: convertNullToUndefined(existingMetric.snatch),
        franTime: convertNullToUndefined(existingMetric.franTime),
        murphTime: convertNullToUndefined(existingMetric.murphTime),
        cindyRounds: convertNullToUndefined(existingMetric.cindyRounds),
        graceTime: convertNullToUndefined(existingMetric.graceTime),
        helenTime: convertNullToUndefined(existingMetric.helenTime),
        maxPullUps: convertNullToUndefined(existingMetric.maxPullUps),
        maxPushUps: convertNullToUndefined(existingMetric.maxPushUps),
        plankTime: convertNullToUndefined(existingMetric.plankTime),
        customMetrics: existingMetric.customMetrics || {},
        notes: existingMetric.notes || "",
      });
    }
  }, [existingMetric, athleteId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const handleCustomMetricsChange = (customMetrics: Record<string, number>) => {
    setFormData((prev) => ({
      ...prev,
      customMetrics,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (metricId) {
        await updateMetric.mutateAsync({
          id: metricId,
          data: formData as UpdateAthleteMetricDto,
        });
      } else {
        await createMetric.mutateAsync(formData as CreateAthleteMetricDto);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar metrica:", error);
    }
  };

  const sections = [
    { id: "body" as const, label: "Corporales" },
    { id: "perimeters" as const, label: "Perimetros" },
    { id: "lifts" as const, label: "Levantamientos" },
    { id: "benchmarks" as const, label: "Benchmarks" },
    { id: "other" as const, label: "Otros" },
    { id: "custom" as const, label: "Personalizadas" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {metricId ? "Editar Metrica" : "Nueva Medicion"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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

          {/* Tabs de sección */}
          <div className="mt-4 flex space-x-4 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`
                  whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors
                  ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }
                `}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Fecha (siempre visible) */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de Medicion
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Sección: Métricas Corporales */}
          {activeSection === "body" && (
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Peso (kg)"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Grasa Corporal (%)"
                name="bodyFatPercent"
                value={formData.bodyFatPercent}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Masa Muscular (kg)"
                name="muscleMass"
                value={formData.muscleMass}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="IMC"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          )}

          {/* Sección: Perímetros */}
          {activeSection === "perimeters" && (
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Cintura (cm)"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Cadera (cm)"
                name="hip"
                value={formData.hip}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Pecho (cm)"
                name="chest"
                value={formData.chest}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Brazo Derecho (cm)"
                name="rightArm"
                value={formData.rightArm}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Brazo Izquierdo (cm)"
                name="leftArm"
                value={formData.leftArm}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Muslo Derecho (cm)"
                name="rightThigh"
                value={formData.rightThigh}
                onChange={handleChange}
                step="0.1"
              />
              <NumberInput
                label="Muslo Izquierdo (cm)"
                name="leftThigh"
                value={formData.leftThigh}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          )}

          {/* Sección: Levantamientos 1RM */}
          {activeSection === "lifts" && (
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Sentadilla Trasera (kg)"
                name="backSquat"
                value={formData.backSquat}
                onChange={handleChange}
                step="0.5"
              />
              <NumberInput
                label="Sentadilla Frontal (kg)"
                name="frontSquat"
                value={formData.frontSquat}
                onChange={handleChange}
                step="0.5"
              />
              <NumberInput
                label="Peso Muerto (kg)"
                name="deadlift"
                value={formData.deadlift}
                onChange={handleChange}
                step="0.5"
              />
              <NumberInput
                label="Press de Banca (kg)"
                name="benchPress"
                value={formData.benchPress}
                onChange={handleChange}
                step="0.5"
              />
              <NumberInput
                label="Press Militar (kg)"
                name="shoulderPress"
                value={formData.shoulderPress}
                onChange={handleChange}
                step="0.5"
              />
              <NumberInput
                label="Cargada y Envion (kg)"
                name="cleanAndJerk"
                value={formData.cleanAndJerk}
                onChange={handleChange}
                step="0.5"
              />
              <NumberInput
                label="Arrancada (kg)"
                name="snatch"
                value={formData.snatch}
                onChange={handleChange}
                step="0.5"
              />
            </div>
          )}

          {/* Sección: Benchmark WODs */}
          {activeSection === "benchmarks" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Los tiempos se ingresan en segundos
              </p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Fran (21-15-9) - segundos"
                  name="franTime"
                  value={formData.franTime}
                  onChange={handleChange}
                />
                <NumberInput
                  label="Murph - segundos"
                  name="murphTime"
                  value={formData.murphTime}
                  onChange={handleChange}
                />
                <NumberInput
                  label="Cindy (20min) - rondas"
                  name="cindyRounds"
                  value={formData.cindyRounds}
                  onChange={handleChange}
                />
                <NumberInput
                  label="Grace (30 C&J) - segundos"
                  name="graceTime"
                  value={formData.graceTime}
                  onChange={handleChange}
                />
                <NumberInput
                  label="Helen - segundos"
                  name="helenTime"
                  value={formData.helenTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Sección: Otros */}
          {activeSection === "other" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Pull-ups Maximos"
                  name="maxPullUps"
                  value={formData.maxPullUps}
                  onChange={handleChange}
                />
                <NumberInput
                  label="Push-ups Maximos"
                  name="maxPushUps"
                  value={formData.maxPushUps}
                  onChange={handleChange}
                />
                <NumberInput
                  label="Plancha (segundos)"
                  name="plankTime"
                  value={formData.plankTime}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Observaciones adicionales sobre esta medicion..."
                />
              </div>
            </div>
          )}

          {/* Seccion: Metricas Personalizadas */}
          {activeSection === "custom" && (
            <CustomMetricsManager
              customMetrics={formData.customMetrics || {}}
              onChange={handleCustomMetricsChange}
            />
          )}

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMetric.isPending || updateMetric.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMetric.isPending || updateMetric.isPending
                ? "Guardando..."
                : metricId
                  ? "Actualizar"
                  : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente auxiliar para inputs numéricos
function NumberInput({
  label,
  name,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  name: string;
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        step={step}
        min="0"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
