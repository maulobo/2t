"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAthleteId } from "@/lib/api/hooks/useAthleteId";
import { useActiveAthleteActivities } from "@/lib/api/hooks/useActivities";
import { useTrainingsByMonth } from "@/lib/api/hooks/useTrainings";
import { paymentsApi } from "@/lib/api/payments";
import { useQuery } from "@tanstack/react-query";
import BlockedAccess from "@/components/athlete/BlockedAccess";
import Link from "next/link";
import type { Training } from "@/types/athlete";

export default function AthleteHistoryPage() {
  const { user } = useAuth();
  const { athleteId } = useAthleteId(user?.id);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  // Format month as YYYY-MM for the API
  const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  
  // 1. Obtener entrenamientos del mes (Raw)
  const { data: monthTrainings = [], isLoading: loadingTrainings } = useTrainingsByMonth(monthStr);
  
  // 2. Obtener actividades inscritas del atleta
  const { data: enrolledActivities, isLoading: loadingActivities } = useActiveAthleteActivities(athleteId || "");

  // 3. Obtener pagos del atleta
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', athleteId],
    queryFn: () => paymentsApi.getByAthlete(athleteId || ""),
    enabled: !!athleteId,
  });

  const loading = loadingTrainings || loadingActivities || loadingPayments;

  // Filtrar entrenamientos visibles (misma lógica que en /entrenamiento)
  const visibleTrainings = useMemo(() => {
    if (!monthTrainings || !enrolledActivities || !payments) {
      return [];
    }

    const visible: Training[] = [];

    // Helper: verificar si un pago es válido (APPROVED y no vencido)
    const isPaymentValid = (p: typeof payments[0]) => {
      if (p.status !== 'APPROVED') return false;
      
      const endDate = new Date(p.periodEnd);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return endOfDay >= today;
    };

    // Verificar si tiene al menos un pago activo (para trainings generales)
    const hasAnyActivePayment = payments.some(isPaymentValid);

    monthTrainings.forEach(training => {
      // Training sin activityId = General
      // Solo visible si tiene AL MENOS un pago activo
      if (!training.activityId) {
        if (hasAnyActivePayment) {
          visible.push(training);
        }
        return;
      }

      // Training con activityId específico
      // 1. Verificar si está inscrito
      const isEnrolled = enrolledActivities.some(a => a.activityId === training.activityId);
      if (!isEnrolled) return;

      // 2. Verificar si tiene pago activo para ESA actividad específica
      const hasValidPayment = payments.some(p => {
        return p.activityId === training.activityId && isPaymentValid(p);
      });

      if (hasValidPayment) {
        visible.push(training);
      }
    });

    return visible;
  }, [monthTrainings, enrolledActivities, payments]);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTrainingsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return visibleTrainings.filter(training => training.date.startsWith(dateStr));
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Verificar si tiene algún pago activo para mostrar acceso
  const hasAnyActivePayment = useMemo(() => {
    if (!payments) return false;
    
    return payments.some(p => {
      if (p.status !== 'APPROVED') return false;
      
      const endDate = new Date(p.periodEnd);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return endOfDay >= today;
    });
  }, [payments]);

  // Pantalla de bloqueo si no tiene acceso
  if (!loadingPayments && !hasAnyActivePayment) {
    return <BlockedAccess title="Historial Bloqueado" message="Necesitas un pago activo para ver tu historial de entrenamientos." />;
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const formatDate = (dateStr: string) => {
    // Usar la fecha como está, sin conversión a UTC
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Convertir URL de YouTube a formato embed
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let videoId = '';

      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Historial de Entrenamientos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Revisa los entrenamientos pasados y programados
        </p>
      </div>

      {/* Calendario */}
      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800 sm:p-6">
        {/* Controles del mes */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Navegación con flechas */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Mes anterior"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Mes siguiente"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Selectores de mes y año */}
          <div className="flex gap-2">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Headers de días */}
          {dayNames.map(day => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 sm:text-sm"
            >
              {day}
            </div>
          ))}

          {/* Días del mes */}
          {loading ? (
            <div className="col-span-7 py-20 text-center text-gray-500">
              Cargando calendario...
            </div>
          ) : (
            getDaysInMonth().map((date, index) => {
              const trainingsForDay = getTrainingsForDate(date);
              const isToday = date && 
                date.toDateString() === new Date().toDateString();
              const isPast = isPastDate(date);

              return (
                <div
                  key={index}
                  className={`min-h-16 rounded-lg border p-1 transition-colors sm:min-h-24 sm:p-2 ${
                    isToday
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                      : "border-gray-200 dark:border-gray-700"
                  } ${
                    isPast && !isToday
                      ? "bg-gray-50 dark:bg-gray-900/50"
                      : ""
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-xs font-medium sm:text-sm ${
                        isToday 
                          ? "text-brand-600 dark:text-brand-400" 
                          : isPast
                          ? "text-gray-400 dark:text-gray-600"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {trainingsForDay.length > 0 && (
                        <div className="mt-1 space-y-0.5 sm:space-y-1">
                          {trainingsForDay.map(training => (
                            <div
                              key={training.id}
                              onClick={() => setSelectedTraining(training)}
                              className="cursor-pointer truncate rounded bg-brand-100 px-1 py-0.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:hover:bg-brand-900/70"
                              title={training.title}
                            >
                              {training.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de detalle del entrenamiento */}
      {selectedTraining && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTraining(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTraining.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(selectedTraining.date)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTraining(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Activity badge */}
            {selectedTraining.activity && (
              <div className="mb-4">
                <span 
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                  style={{
                    backgroundColor: `${selectedTraining.activity.color}20`,
                    color: selectedTraining.activity.color,
                  }}
                >
                  {selectedTraining.activity.name}
                </span>
              </div>
            )}

            {/* Descripción del entrenamiento */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Descripción del Entrenamiento
              </h4>
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                {selectedTraining.description}
              </pre>
            </div>

            {/* Video de YouTube (si existe) */}
            {selectedTraining.videoUrl && (() => {
              const embedUrl = getYouTubeEmbedUrl(selectedTraining.videoUrl);
              return embedUrl ? (
                <div className="mb-6">
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Video Explicativo
                  </h4>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <iframe
                      src={embedUrl}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>
              ) : null;
            })()}

            {/* Botón para ir al entrenamiento del día si es hoy */}
            {new Date(selectedTraining.date).toDateString() === new Date().toDateString() && (
              <div className="flex justify-end">
                <Link
                  href="/athlete/entrenamiento"
                  className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
                  onClick={() => setSelectedTraining(null)}
                >
                  Ir al Entrenamiento del Día
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
