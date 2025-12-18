"use client";

import React, { useState, useEffect } from "react";
import { useCreateFee, useCurrentFee } from "@/lib/api/hooks/useFees";
import { ACTIVITY_TYPES } from "@/types/fee";

interface CreateFeeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateFeeForm({
  onSuccess,
  onCancel,
}: CreateFeeFormProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [description, setDescription] = useState("");
  const [endCurrentFee, setEndCurrentFee] = useState(true);

  const createFeeMutation = useCreateFee();
  const { data: currentFee } = useCurrentFee();

  // Establecer fecha por defecto (primer día del mes siguiente)
  useEffect(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    setValidFrom(nextMonth.toISOString().split('T')[0]);
  }, []);

  // Establecer monto por defecto basado en la cuota actual
  useEffect(() => {
    if (currentFee && !amount) {
      setAmount(currentFee.amount.toString());
    }
  }, [currentFee, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !validFrom || !activityType || !activityName) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("El monto debe ser un número válido mayor a 0");
      return;
    }

    try {
      await createFeeMutation.mutateAsync({
        amount: amountNum,
        currency,
        activityType,
        activityName,
        validFrom: new Date(validFrom).toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        description: description || undefined,
        // TODO: Agregar coachId cuando tengamos contexto de usuario
      });

      alert("Cuota creada exitosamente");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating fee:", error);
      alert("Error al crear la cuota");
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cuota actual */}
      {currentFee && (
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">
            Cuota Actual Vigente
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {formatCurrency(currentFee.amount.toString())} - Válida desde{" "}
            {new Date(currentFee.validFrom).toLocaleDateString("es-AR")}
          </p>
        </div>
      )}

      {/* Tipo de Actividad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Actividad <span className="text-red-500">*</span>
        </label>
        <select
          value={activityType}
          onChange={(e) => {
            setActivityType(e.target.value);
            const selected = Object.values(ACTIVITY_TYPES).find(at => at.code === e.target.value);
            if (selected) {
              setActivityName(selected.name);
            }
          }}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          required
        >
          <option value="">Seleccionar tipo de actividad</option>
          {Object.values(ACTIVITY_TYPES).map((activity) => (
            <option key={activity.code} value={activity.code}>
              {activity.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          La cuota se aplicará solo a atletas con esta actividad
        </p>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Monto de la cuota <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="80000"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            required
          />
          <div className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">
            {currency}
          </div>
        </div>
        {amount && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(amount)}
          </p>
        )}
      </div>

      {/* Moneda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Moneda
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="ARS">ARS - Peso Argentino</option>
          <option value="USD">USD - Dólar Estadounidense</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </div>

      {/* Fecha de vigencia */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Válida desde <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Válida hasta (opcional)
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            min={validFrom}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Dejar vacío si la cuota es indefinida
          </p>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción (opcional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Incremento por inflación, Cuota base 2025"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Opciones avanzadas */}
      {currentFee && (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={endCurrentFee}
              onChange={(e) => setEndCurrentFee(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Finalizar cuota actual automáticamente
            </span>
          </label>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            La cuota actual se marcará como finalizada el día anterior a esta nueva cuota
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={createFeeMutation.isPending}
          className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createFeeMutation.isPending ? "Creando..." : "Crear Cuota"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={createFeeMutation.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}