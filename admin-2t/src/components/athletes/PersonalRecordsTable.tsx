"use client";

import { usePersonalRecords } from "@/hooks/useAthleteMetrics";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PersonalRecordsTableProps {
  athleteId: string;
}

export function PersonalRecordsTable({ athleteId }: PersonalRecordsTableProps) {
  const { data, isLoading, error } = usePersonalRecords(athleteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">
          Error al cargar los records personales
        </p>
      </div>
    );
  }

  const hasRecords = data && data.records && Object.keys(data.records).some(key => data.records[key as keyof typeof data.records]);

  if (!data || !hasRecords) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay records personales registrados aun
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Agrega mediciones con levantamientos 1RM para ver tus records
        </p>
      </div>
    );
  }

  const exercises = [
    { key: "backSquat" as const, label: "Sentadilla Trasera" },
    { key: "frontSquat" as const, label: "Sentadilla Frontal" },
    { key: "deadlift" as const, label: "Peso Muerto" },
    { key: "benchPress" as const, label: "Press de Banca" },
    { key: "shoulderPress" as const, label: "Press Militar" },
    { key: "cleanAndJerk" as const, label: "Cargada y Envion" },
    { key: "snatch" as const, label: "Arrancada" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((exercise) => {
          const record = data.records[exercise.key];
          
          return (
            <div
              key={exercise.key}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {exercise.label}
              </h3>
              {record ? (
                <>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {record.value} kg
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(record.date), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Sin registro
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
