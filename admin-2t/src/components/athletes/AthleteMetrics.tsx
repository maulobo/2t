"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useAthleteMetrics,
  useLatestMetric,
  useDeleteMetric,
} from "@/hooks/useAthleteMetrics";
import { MetricForm } from "./MetricForm";
import { WeightProgressChart } from "./WeightProgressChart";
import { PersonalRecordsTable } from "./PersonalRecordsTable";
import { BenchmarkRecordsTable } from "./BenchmarkRecordsTable";

interface AthleteMetricsProps {
  athleteId: string;
}

export function AthleteMetrics({ athleteId }: AthleteMetricsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "latest" | "history" | "weight" | "records" | "benchmarks"
  >("latest");

  const { data: metrics, isLoading: metricsLoading } =
    useAthleteMetrics(athleteId);
  const { data: latestMetric, isLoading: latestLoading } =
    useLatestMetric(athleteId);
  const deleteMetric = useDeleteMetric();

  const handleDelete = async (id: string) => {
    if (confirm("¿Estas seguro de eliminar esta metrica?")) {
      try {
        await deleteMetric.mutateAsync(id);
      } catch (error) {
        console.error("Error al eliminar metrica:", error);
      }
    }
  };

  const handleEdit = (id: string) => {
    setEditingMetricId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMetricId(null);
  };

  const tabs = [
    { id: "latest" as const, label: "Ultima Medicion" },
    { id: "history" as const, label: "Historial" },
    { id: "weight" as const, label: "Progreso de Peso" },
    { id: "records" as const, label: "Records 1RM" },
    { id: "benchmarks" as const, label: "Benchmark WODs" },
  ];

  return (
    <div className="space-y-6">
      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Metricas del Atleta
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Medicion
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="min-h-[400px]">
        {activeTab === "latest" && (
          <LatestMetricView
            metric={latestMetric || undefined}
            isLoading={latestLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "history" && (
          <MetricsHistoryView
            metrics={metrics || []}
            isLoading={metricsLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "weight" && <WeightProgressChart athleteId={athleteId} />}

        {activeTab === "records" && (
          <PersonalRecordsTable athleteId={athleteId} />
        )}

        {activeTab === "benchmarks" && (
          <BenchmarkRecordsTable athleteId={athleteId} />
        )}
      </div>

      {/* Modal de formulario */}
      {isFormOpen && (
        <MetricForm
          athleteId={athleteId}
          metricId={editingMetricId}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

// Componente para mostrar la última medición
function LatestMetricView({
  metric,
  isLoading,
  onEdit,
  onDelete,
}: {
  metric: import("@/types/athlete").AthleteMetric | undefined;
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!metric) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay metricas registradas aun
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Haz clic en Nueva Medicion para registrar la primera metrica
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fecha y acciones */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Medicion del{" "}
          {format(new Date(metric.date), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(metric.id)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(metric.id)}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Métricas corporales */}
      <MetricSection title="Metricas Corporales">
        <MetricGrid>
          {metric.weight && (
            <MetricCard label="Peso" value={`${metric.weight} kg`} />
          )}
          {metric.bodyFatPercent && (
            <MetricCard
              label="Grasa Corporal"
              value={`${metric.bodyFatPercent}%`}
            />
          )}
          {metric.muscleMass && (
            <MetricCard
              label="Masa Muscular"
              value={`${metric.muscleMass} kg`}
            />
          )}
          {metric.bmi && <MetricCard label="IMC" value={metric.bmi.toFixed(1)} />}
        </MetricGrid>
      </MetricSection>

      {/* Perímetros */}
      {(metric.waist ||
        metric.hip ||
        metric.chest ||
        metric.rightArm ||
        metric.leftArm ||
        metric.rightThigh ||
        metric.leftThigh) && (
        <MetricSection title="Perimetros (cm)">
          <MetricGrid>
            {metric.waist && (
              <MetricCard label="Cintura" value={`${metric.waist} cm`} />
            )}
            {metric.hip && (
              <MetricCard label="Cadera" value={`${metric.hip} cm`} />
            )}
            {metric.chest && (
              <MetricCard label="Pecho" value={`${metric.chest} cm`} />
            )}
            {metric.rightArm && (
              <MetricCard label="Brazo Derecho" value={`${metric.rightArm} cm`} />
            )}
            {metric.leftArm && (
              <MetricCard label="Brazo Izquierdo" value={`${metric.leftArm} cm`} />
            )}
            {metric.rightThigh && (
              <MetricCard label="Muslo Derecho" value={`${metric.rightThigh} cm`} />
            )}
            {metric.leftThigh && (
              <MetricCard label="Muslo Izquierdo" value={`${metric.leftThigh} cm`} />
            )}
          </MetricGrid>
        </MetricSection>
      )}

      {/* Levantamientos 1RM */}
      {(metric.backSquat ||
        metric.frontSquat ||
        metric.deadlift ||
        metric.benchPress ||
        metric.shoulderPress ||
        metric.cleanAndJerk ||
        metric.snatch) && (
        <MetricSection title="Levantamientos 1RM (kg)">
          <MetricGrid>
            {metric.backSquat && (
              <MetricCard label="Sentadilla Trasera" value={`${metric.backSquat} kg`} />
            )}
            {metric.frontSquat && (
              <MetricCard label="Sentadilla Frontal" value={`${metric.frontSquat} kg`} />
            )}
            {metric.deadlift && (
              <MetricCard label="Peso Muerto" value={`${metric.deadlift} kg`} />
            )}
            {metric.benchPress && (
              <MetricCard label="Press de Banca" value={`${metric.benchPress} kg`} />
            )}
            {metric.shoulderPress && (
              <MetricCard label="Press Militar" value={`${metric.shoulderPress} kg`} />
            )}
            {metric.cleanAndJerk && (
              <MetricCard label="Cargada y Envion" value={`${metric.cleanAndJerk} kg`} />
            )}
            {metric.snatch && (
              <MetricCard label="Arrancada" value={`${metric.snatch} kg`} />
            )}
          </MetricGrid>
        </MetricSection>
      )}

      {/* Benchmark WODs */}
      {(metric.franTime ||
        metric.murphTime ||
        metric.cindyRounds ||
        metric.graceTime ||
        metric.helenTime) && (
        <MetricSection title="Benchmark WODs">
          <MetricGrid>
            {metric.franTime && (
              <MetricCard
                label="Fran"
                value={formatTime(metric.franTime)}
              />
            )}
            {metric.murphTime && (
              <MetricCard
                label="Murph"
                value={formatTime(metric.murphTime)}
              />
            )}
            {metric.cindyRounds && (
              <MetricCard
                label="Cindy"
                value={`${metric.cindyRounds} rondas`}
              />
            )}
            {metric.graceTime && (
              <MetricCard
                label="Grace"
                value={formatTime(metric.graceTime)}
              />
            )}
            {metric.helenTime && (
              <MetricCard
                label="Helen"
                value={formatTime(metric.helenTime)}
              />
            )}
          </MetricGrid>
        </MetricSection>
      )}

      {/* Otros */}
      {(metric.maxPullUps || metric.maxPushUps || metric.plankTime) && (
        <MetricSection title="Otros">
          <MetricGrid>
            {metric.maxPullUps && (
              <MetricCard label="Pull-ups Max" value={`${metric.maxPullUps} reps`} />
            )}
            {metric.maxPushUps && (
              <MetricCard label="Push-ups Max" value={`${metric.maxPushUps} reps`} />
            )}
            {metric.plankTime && (
              <MetricCard label="Plancha" value={formatTime(metric.plankTime)} />
            )}
          </MetricGrid>
        </MetricSection>
      )}

      {/* Metricas Personalizadas */}
      {metric.customMetrics && Object.keys(metric.customMetrics).length > 0 && (
        <MetricSection title="Metricas Personalizadas">
          <MetricGrid>
            {Object.entries(metric.customMetrics).map(([key, value]) => (
              <MetricCard
                key={key}
                label={formatMetricName(key)}
                value={value.toString()}
              />
            ))}
          </MetricGrid>
        </MetricSection>
      )}

      {/* Notas */}
      {metric.notes && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {metric.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// Componente para el historial de métricas
function MetricsHistoryView({
  metrics,
  isLoading,
  onEdit,
  onDelete,
}: {
  metrics: import("@/types/athlete").AthleteMetric[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay metricas registradas aun
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          El historial aparecera aqui una vez que agregues mediciones
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Peso
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Grasa
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              IMC
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Back Squat
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Deadlift
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Personalizadas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {metrics.map((metric) => (
            <tr
              key={metric.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                {format(new Date(metric.date), "dd/MM/yyyy", { locale: es })}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                {metric.weight ? `${metric.weight} kg` : "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                {metric.bodyFatPercent ? `${metric.bodyFatPercent}%` : "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                {metric.bmi ? metric.bmi.toFixed(1) : "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                {metric.backSquat ? `${metric.backSquat} kg` : "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                {metric.deadlift ? `${metric.deadlift} kg` : "-"}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {metric.customMetrics && Object.keys(metric.customMetrics).length > 0 ? (
                  <span className="text-xs">
                    {Object.keys(metric.customMetrics).length} metrica(s)
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(metric.id)}
                  className="mr-3 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(metric.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componentes auxiliares
function MetricSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

// Función auxiliar para formatear tiempo en segundos a mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Función auxiliar para formatear nombres de métricas personalizadas
function formatMetricName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
