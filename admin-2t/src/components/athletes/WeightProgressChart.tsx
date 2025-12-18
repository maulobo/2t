"use client";

import { useWeightProgress } from "@/hooks/useAthleteMetrics";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface WeightProgressChartProps {
  athleteId: string;
}

export function WeightProgressChart({ athleteId }: WeightProgressChartProps) {
  const { data, isLoading, error } = useWeightProgress(athleteId);

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
          Error al cargar el progreso de peso
        </p>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay datos suficientes para mostrar el progreso de peso
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Agrega al menos una medicion con peso para ver el grafico
        </p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const sortedData = [...data.data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const categories = sortedData.map((item) =>
    format(new Date(item.date), "dd/MM/yy", { locale: es })
  );

  const series = [
    {
      name: "Peso (kg)",
      data: sortedData.map((item) => item.weight),
    },
  ];

  // Agregar serie de IMC si existe
  const hasBMI = sortedData.some((item) => item.bmi !== undefined && item.bmi !== null);
  if (hasBMI) {
    series.push({
      name: "IMC",
      data: sortedData.map((item) => (item.bmi !== undefined && item.bmi !== null ? item.bmi : 0)),
    });
  }

  // Agregar serie de grasa corporal si existe
  const hasBodyFat = sortedData.some(
    (item) => item.bodyFatPercent !== undefined && item.bodyFatPercent !== null
  );
  if (hasBodyFat) {
    series.push({
      name: "Grasa Corporal (%)",
      data: sortedData.map((item) => (item.bodyFatPercent !== undefined && item.bodyFatPercent !== null ? item.bodyFatPercent : 0)),
    });
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
      background: "transparent",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#9CA3AF",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Peso (kg)",
          style: {
            color: "#3B82F6",
          },
        },
        labels: {
          style: {
            colors: "#9CA3AF",
          },
          formatter: (value: number) => value.toFixed(1),
        },
      },
      hasBMI
        ? {
            opposite: true,
            title: {
              text: "IMC / Grasa %",
              style: {
                color: "#10B981",
              },
            },
            labels: {
              style: {
                colors: "#9CA3AF",
              },
              formatter: (value: number) => value.toFixed(1),
            },
          }
        : undefined,
    ].filter(Boolean) as ApexCharts.ApexOptions["yaxis"],
    grid: {
      borderColor: "#374151",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
      y: {
        formatter: (value, { seriesIndex }) => {
          if (seriesIndex === 0) return `${value.toFixed(1)} kg`;
          if (seriesIndex === 1 && hasBMI) return value.toFixed(1);
          if (seriesIndex === 2 && hasBodyFat) return `${value.toFixed(1)}%`;
          return value.toFixed(1);
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#9CA3AF",
      },
    },
  };

  // Calcular estadísticas
  const weights = sortedData.map((item) => item.weight);
  const currentWeight = weights[weights.length - 1];
  const initialWeight = weights[0];
  const weightChange = currentWeight - initialWeight;

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Peso Actual</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {currentWeight.toFixed(1)} kg
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Peso Inicial</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {initialWeight.toFixed(1)} kg
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Cambio Total</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              weightChange > 0
                ? "text-green-600 dark:text-green-400"
                : weightChange < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-900 dark:text-white"
            }`}
          >
            {weightChange > 0 ? "+" : ""}
            {weightChange.toFixed(1)} kg
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Mediciones</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {sortedData.length}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Evolucion del Peso
        </h3>
        <Chart
          options={options}
          series={series}
          type="line"
          height={400}
        />
      </div>

      {/* Tabla de datos */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Peso
                </th>
                {hasBMI && (
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    IMC
                  </th>
                )}
                {hasBodyFat && (
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Grasa Corporal
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Cambio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((item, index) => {
                const prevWeight = index > 0 ? sortedData[index - 1].weight : null;
                const change = prevWeight ? item.weight - prevWeight : 0;

                return (
                  <tr key={item.date} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                      {format(new Date(item.date), "dd/MM/yyyy", { locale: es })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.weight.toFixed(1)} kg
                    </td>
                    {hasBMI && (
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        {item.bmi ? item.bmi.toFixed(1) : "-"}
                      </td>
                    )}
                    {hasBodyFat && (
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        {item.bodyFatPercent ? `${item.bodyFatPercent.toFixed(1)}%` : "-"}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3">
                      {prevWeight ? (
                        <span
                          className={`${
                            change > 0
                              ? "text-green-600 dark:text-green-400"
                              : change < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)} kg
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
