"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAthleteId } from "@/lib/api/hooks/useAthleteId";
import { useActiveAthleteActivities } from "@/lib/api/hooks/useActivities";
import { useAthleteTrainingToday } from "@/lib/api/hooks/useTrainings";
import { paymentsApi } from "@/lib/api/payments";
import { useQuery } from "@tanstack/react-query";
import { Training } from "@/types/athlete";
import Link from "next/link";

// Componente para mostrar un entrenamiento individual
function TrainingCard({ training }: { training: Training }) {
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState("");

  const handleComplete = () => {
    if (time) {
      setCompleted(true);
      // TODO: Aquí podrías guardar el resultado en el backend si existe ese endpoint
    }
  };

  // Formatear fecha (corregir zona horaria)
  const formatDate = (dateStr: string) => {
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header Clean */}
      <div className="border-b border-gray-100 p-6 dark:border-gray-800 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {training.activity && (
                <span 
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ 
                    backgroundColor: `${training.activity.color}15`,
                    color: training.activity.color 
                  }}
                >
                  {training.activity.name}
                </span>
              )}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatDate(training.date)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {training.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-600 dark:text-gray-300">
            {training.description}
          </pre>
        </div>

        {/* Video Section */}
        {training.videoUrl && (() => {
          const embedUrl = getYouTubeEmbedUrl(training.videoUrl);
          return embedUrl ? (
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Video Explicativo
              </h3>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
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

        {/* Action Section */}
        <div className="mt-8 border-t border-gray-100 pt-8 dark:border-gray-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Registro
          </h3>

          {!completed ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-xs">
                <label
                  htmlFor={`time-${training.id}`}
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tiempo / Resultado
                </label>
                <input
                  type="text"
                  id={`time-${training.id}`}
                  placeholder="ej: 42:30 o 5 rondas"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800"
                />
              </div>

              <button
                onClick={handleComplete}
                disabled={!time}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
              >
                Completar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium">¡Entrenamiento registrado!</p>
                <p className="text-sm opacity-90">Resultado: {time}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntrenamientoPage() {
  const { user } = useAuth();
  const { athleteId } = useAthleteId(user?.id);
  
  // 1. Obtener entrenamientos del día (Raw)
  const { data: todayTrainings, isLoading: loadingTrainings } = useAthleteTrainingToday(athleteId || undefined);
  
  // 2. Obtener actividades inscritas del atleta
  const { data: enrolledActivities, isLoading: loadingActivities } = useActiveAthleteActivities(athleteId || "");

  // 3. Obtener pagos del atleta
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', athleteId],
    queryFn: () => paymentsApi.getByAthlete(athleteId || ""),
    enabled: !!athleteId,
  });

  const loading = loadingTrainings || loadingActivities || loadingPayments;

  // Filtrar entrenamientos visibles
  const { visibleTrainings, blockedTrainings, hasAnyActivePayment } = useMemo(() => {
    if (!todayTrainings || !enrolledActivities || !payments) {
      return { visibleTrainings: [], blockedTrainings: [], hasAnyActivePayment: false };
    }

    const visible: Training[] = [];
    const blocked: Training[] = [];

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

    todayTrainings.forEach(training => {
      // Training sin activityId = General (CrossFit base, warmup, etc)
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
      if (!isEnrolled) return; // Si no está inscrito, ni siquiera lo contamos

      // 2. Verificar si tiene pago activo para ESA actividad específica
      const hasValidPayment = payments.some(p => {
        return p.activityId === training.activityId && isPaymentValid(p);
      });

      if (hasValidPayment) {
        visible.push(training);
      } else {
        blocked.push(training);
      }
    });

    return { visibleTrainings: visible, blockedTrainings: blocked, hasAnyActivePayment };
  }, [todayTrainings, enrolledActivities, payments]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando entrenamiento del día...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay entrenamientos bloqueados por falta de pago
  if (visibleTrainings.length === 0 && blockedTrainings.length > 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-2xl dark:border-red-600 dark:bg-red-900/30">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
            <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="mb-4 text-2xl font-bold text-red-900 dark:text-red-200">
            Entrenamiento Bloqueado
          </h2>
          
          <p className="mb-6 text-red-800 dark:text-red-300">
            Tienes entrenamientos programados para hoy, pero tu pago para estas actividades ha vencido o no está registrado.
          </p>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {blockedTrainings.map(t => (
              <span key={t.id} className="rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-800 dark:text-red-200">
                {t.activity?.name || 'Actividad'}
              </span>
            ))}
          </div>
          
          <Link
            href="/athlete/payments"
            className="inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Ver Mis Pagos
          </Link>
        </div>
      </div>
    );
  }

  if (visibleTrainings.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/athlete/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No hay entrenamiento programado
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Hoy es un buen día para descansar o trabajar en tu movilidad.
            Si crees que es un error, contacta a tu coach.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/athlete/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="space-y-8">
        {/* Mostrar mensaje si hay algunos bloqueados pero otros visibles */}
        {blockedTrainings.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Entrenamientos adicionales bloqueados
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Tienes {blockedTrainings.length} entrenamiento(s) más que requieren un pago activo para visualizarse.
                </p>
              </div>
            </div>
          </div>
        )}

        {visibleTrainings.map((training) => (
          <TrainingCard key={training.id} training={training} />
        ))}
      </div>
    </div>
  );
}
