"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAthletePaymentStatus } from "@/lib/api/hooks/useAthletePaymentStatus";
import { useTodayTraining } from "@/lib/api/hooks/useTrainings";
import Link from "next/link";

export default function WodPage() {
  const { user } = useAuth();
  const { paymentStatus, loading: loadingPayment } = useAthletePaymentStatus(user?.id);
  
  const hasAccess = paymentStatus && !paymentStatus.isExpired;

  // Usar el nuevo hook de trainings
  const { data: todayTraining, isLoading: loading } = useTodayTraining();
  
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState("");

  const currentWod = todayTraining;

  const handleComplete = () => {
    if (time) {
      setCompleted(true);
      // TODO: Aquí podrías guardar el resultado en el backend si existe ese endpoint
    }
  };

  // Pantalla de bloqueo si no tiene acceso
  if (!loadingPayment && !hasAccess) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-2xl dark:border-red-600 dark:bg-red-900/30">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
            <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="mb-4 text-2xl font-bold text-red-900 dark:text-red-200">
            Entrenamiento del Día Bloqueado
          </h2>
          
          <p className="mb-6 text-red-800 dark:text-red-300">
            Necesitas un pago activo para acceder al entrenamiento del día.
          </p>
          
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

  if (!currentWod) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/athlete/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </Link>

        <div className="rounded-xl bg-white p-12 text-center shadow dark:bg-gray-800">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            No hay entrenamiento programado para hoy
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Aprovecha para descansar o hacer movilidad
          </p>
        </div>
      </div>
    );
  }

  // Formatear fecha (corregir zona horaria)
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back button */}
      <Link
        href="/athlete/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90">Entrenamiento del Día</p>
            <h1 className="mt-2 text-4xl font-bold">{currentWod.title}</h1>
            <p className="mt-2 text-sm opacity-90">{formatDate(currentWod.date)}</p>
          </div>
          {currentWod.activity && (
            <div 
              className="rounded-lg px-4 py-2 backdrop-blur-sm"
              style={{ backgroundColor: `${currentWod.activity.color}40` }}
            >
              <p className="text-sm font-semibold">
                {currentWod.activity.icon} {currentWod.activity.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main WOD */}
      <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Workout
        </h2>

        <div className="space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-lg text-gray-700 dark:text-gray-300">
            {currentWod.description}
          </pre>
        </div>
      </div>

      {/* Video de YouTube (si existe) */}
      {currentWod.videoUrl && (() => {
        const embedUrl = getYouTubeEmbedUrl(currentWod.videoUrl);
        return embedUrl ? (
          <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Video Explicativo
            </h2>
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

      {/* Log your time */}
      <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Registrar tu Tiempo
        </h2>

        {!completed ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tiempo (mm:ss)
              </label>
              <input
                type="text"
                id="time"
                placeholder="ej: 42:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleComplete}
              disabled={!time}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
            >
              Marcar como Completado
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
            <svg
              className="mx-auto h-16 w-16 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              ¡Entrenamiento Completado!
            </h3>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
              Tu tiempo: <span className="font-bold">{time}</span>
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              ¡Excelente trabajo! Sigue así.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
