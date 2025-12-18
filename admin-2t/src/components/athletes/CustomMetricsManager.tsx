"use client";

import { useState } from "react";

interface CustomMetric {
  name: string;
  value: number;
}

interface CustomMetricsManagerProps {
  customMetrics: Record<string, number>;
  onChange: (metrics: Record<string, number>) => void;
}

export function CustomMetricsManager({
  customMetrics,
  onChange,
}: CustomMetricsManagerProps) {
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const metrics: CustomMetric[] = Object.entries(customMetrics || {}).map(
    ([name, value]) => ({ name, value })
  );

  const handleAdd = () => {
    if (!newMetricName.trim() || !newMetricValue) return;

    const key = newMetricName.trim().replace(/\s+/g, "_").toLowerCase();
    const value = parseFloat(newMetricValue);

    if (isNaN(value)) return;

    onChange({
      ...customMetrics,
      [key]: value,
    });

    setNewMetricName("");
    setNewMetricValue("");
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(customMetrics[key].toString());
  };

  const handleSaveEdit = (key: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value)) return;

    onChange({
      ...customMetrics,
      [key]: value,
    });

    setEditingKey(null);
    setEditValue("");
  };

  const handleDelete = (key: string) => {
    const newMetrics = { ...customMetrics };
    delete newMetrics[key];
    onChange(newMetrics);
  };

  const formatMetricName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Metricas Personalizadas
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Agrega cualquier metrica adicional que necesites medir
          </p>
        </div>
      </div>

      {/* Lista de métricas existentes */}
      {metrics.length > 0 && (
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatMetricName(metric.name)}
                </p>
                {editingKey === metric.name ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    step="0.1"
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {metric.value}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {editingKey === metric.name ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(metric.name)}
                      className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEdit(metric.name)}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(metric.name)}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar nueva métrica */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
        <p className="mb-3 text-xs font-medium text-gray-700 dark:text-gray-300">
          Agregar Nueva Metrica
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Nombre de la metrica"
              value={newMetricName}
              onChange={(e) => setNewMetricName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ej: Overhead Squat, Turkish Get Up
            </p>
          </div>
          <div>
            <input
              type="number"
              placeholder="Valor"
              value={newMetricValue}
              onChange={(e) => setNewMetricValue(e.target.value)}
              step="0.1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Puede ser peso (kg), tiempo (seg), reps, etc.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newMetricName.trim() || !newMetricValue}
          className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar Metrica
        </button>
      </div>

      {/* Ejemplos */}
      {metrics.length === 0 && (
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-300">
            Ejemplos de metricas personalizadas:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-400">
            <li>• Overhead Squat - 85 kg</li>
            <li>• Pistol Squat - 45 kg</li>
            <li>• Turkish Get Up - 32 kg</li>
            <li>• Handstand Push-ups - 15 reps</li>
            <li>• Box Jump - 75 cm</li>
            <li>• WOD personalizado - 240 segundos</li>
          </ul>
        </div>
      )}
    </div>
  );
}
