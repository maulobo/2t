"use client";

import { useBenchmarkRecords } from "@/hooks/useAthleteMetrics";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BenchmarkRecordsTableProps {
  athleteId: string;
}

export function BenchmarkRecordsTable({ athleteId }: BenchmarkRecordsTableProps) {
  const { data, isLoading, error } = useBenchmarkRecords(athleteId);

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
          Error al cargar los records de benchmarks
        </p>
      </div>
    );
  }

  const hasRecords = data && data.benchmarks && Object.keys(data.benchmarks).some(key => data.benchmarks[key as keyof typeof data.benchmarks]);

  if (!data || !hasRecords) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay records de benchmarks registrados aun
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Agrega mediciones con tiempos de WODs para ver tus records
        </p>
      </div>
    );
  }

  const benchmarks = [
    { key: "fran" as const, label: "Fran", desc: "21-15-9 Thrusters / Pull-ups", isTime: true },
    { key: "murph" as const, label: "Murph", desc: "1 Mile Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1 Mile Run", isTime: true },
    { key: "cindy" as const, label: "Cindy", desc: "20min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Squats", isTime: false },
    { key: "grace" as const, label: "Grace", desc: "30 Clean & Jerk (135/95 lbs)", isTime: true },
    { key: "helen" as const, label: "Helen", desc: "3 Rounds: 400m Run, 21 KB Swings, 12 Pull-ups", isTime: true },
  ];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmarks.map((benchmark) => {
          const record = data.benchmarks[benchmark.key];
          
          return (
            <div
              key={benchmark.key}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {benchmark.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {benchmark.desc}
                  </p>
                </div>
              </div>
              
              {record ? (
                <>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {benchmark.isTime 
                        ? formatTime("time" in record ? record.time : 0)
                        : `${"rounds" in record ? record.rounds : 0} rondas`
                      }
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(record.date), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
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
