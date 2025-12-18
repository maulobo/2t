"use client";

import { useAuth } from '@/context/AuthContext';
import { useAthleteId } from '@/lib/api/hooks/useAthleteId';
import { useAthleteTrainingToday } from '@/lib/api/hooks/useTrainings';
import { useAthletePaymentStatus } from '@/lib/api/hooks/useAthletePaymentStatus';
import MyActivities from '@/components/athlete/MyActivities';
import Link from 'next/link';

export default function AthleteDashboardPage() {
  const { user } = useAuth();
  const { athleteId } = useAthleteId(user?.id);
  
  // Hooks personalizados que encapsulan toda la lógica
  const { paymentStatus, loading: loadingPayment } = useAthletePaymentStatus(user?.id);
  const { data: todayTraining, isLoading: loadingTraining } = useAthleteTrainingToday(athleteId || undefined);


  // Formatear monto sin decimales
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determinar si tiene acceso (pago válido y no expirado)
  const hasAccess = paymentStatus && !paymentStatus.isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* BLOQUEO TOTAL - Sin pago o vencido */}
      {!loadingPayment && !hasAccess && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-2xl dark:border-red-600 dark:bg-red-900/30">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
            <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-red-900 dark:text-red-200">
            Acceso Restringido
          </h2>
          
          <p className="mb-6 text-lg text-red-800 dark:text-red-300">
            {!paymentStatus ? (
              <>No tienes un pago registrado o tu pago está pendiente de aprobación.</>
            ) : (
              <>Tu cuota está vencida desde el {new Date(paymentStatus.nextPaymentDate).toLocaleDateString('es-AR')}.</>
            )}
          </p>
          
          <div className="mb-8 rounded-lg border border-red-300 bg-white/50 p-6 dark:border-red-700 dark:bg-red-900/20">
            <h3 className="mb-3 text-lg font-semibold text-red-900 dark:text-red-200">
              Para acceder al contenido necesitas:
            </h3>
            <ul className="space-y-2 text-left text-red-800 dark:text-red-300">
              <li className="flex items-start gap-2">
                <svg className="mt-1 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Registrar un nuevo pago</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-1 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Que el administrador apruebe tu pago</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-1 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mantener tu cuota al día</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/athlete/payments"
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl dark:bg-red-700 dark:hover:bg-red-600"
            >
              Ver Mis Pagos
            </Link>
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-red-600 bg-white px-6 py-3 font-semibold text-red-600 transition-all hover:bg-red-50 dark:border-red-500 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Contactar Administrador
            </a>
          </div>
          
          <p className="mt-6 text-sm text-red-700 dark:text-red-400">
            📱 También puedes revisar tu historial de pagos en la sección &quot;Mis Pagos&quot;
          </p>
        </div>
      )}

      {/* Contenido normal SOLO si tiene acceso */}
      {!loadingPayment && hasAccess && (
        <>
      {/* Alerta de Pago Próximo a Vencer - Solo si faltan 3 días o menos */}
      {paymentStatus && paymentStatus.isNearExpiration && (
        <div className={`rounded-xl border-2 p-4 shadow-lg ${
          paymentStatus.isExpired
            ? 'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30'
            : 'border-orange-500 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/30'
        }`}>
          <div className="flex items-start gap-4">
            {/* Icono de alerta */}
            <div className={`flex-shrink-0 rounded-full p-2 ${
              paymentStatus.isExpired
                ? 'bg-red-100 dark:bg-red-800/50'
                : 'bg-orange-100 dark:bg-orange-800/50'
            }`}>
              <svg 
                className={`h-6 w-6 ${
                  paymentStatus.isExpired 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            {/* Contenido de la alerta */}
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${
                paymentStatus.isExpired
                  ? 'text-red-900 dark:text-red-200'
                  : 'text-orange-900 dark:text-orange-200'
              }`}>
                {paymentStatus.isExpired ? 'Tu cuota está vencida' : 'Tu cuota está por vencer'}
              </h3>
              <p className={`mt-1 text-sm ${
                paymentStatus.isExpired
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-orange-800 dark:text-orange-300'
              }`}>
                {paymentStatus.isExpired ? (
                  <>
                    Tu cuota venció el{' '}
                    <span className="font-semibold">
                      {new Date(paymentStatus.nextPaymentDate).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    . Por favor, realiza el pago lo antes posible para mantener tu acceso.
                  </>
                ) : (
                  <>
                    Te quedan{' '}
                    <span className="font-bold text-lg">
                      {paymentStatus.daysUntilDue} {paymentStatus.daysUntilDue === 1 ? 'día' : 'días'}
                    </span>
                    {' '}para realizar tu pago. Fecha de vencimiento:{' '}
                    <span className="font-semibold">
                      {new Date(paymentStatus.nextPaymentDate).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </>
                )}
              </p>
            </div>
            
            {/* Cantidad destacada - solo si no está vencido */}
            {!paymentStatus.isExpired && (
              <div className="flex-shrink-0 text-center">
                <div className={`rounded-xl px-6 py-3 ${
                  paymentStatus.daysUntilDue <= 1
                    ? 'bg-red-100 dark:bg-red-800/50'
                    : 'bg-orange-100 dark:bg-orange-800/50'
                }`}>
                  <p className={`text-4xl font-bold ${
                    paymentStatus.daysUntilDue <= 1
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-orange-700 dark:text-orange-300'
                  }`}>
                    {paymentStatus.daysUntilDue}
                  </p>
                  <p className={`text-xs font-medium uppercase ${
                    paymentStatus.daysUntilDue <= 1
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {paymentStatus.daysUntilDue === 1 ? 'día' : 'días'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          ¡Hola, {user?.email.split('@')[0]}!
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Aquí está tu resumen del día
        </p>
      </div>

      {/* Entrenamientos del Día */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Entrenamientos del Día
        </h3>
        {loadingTraining ? (
          <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm dark:bg-gray-800">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"></div>
          </div>
        ) : (todayTraining && todayTraining.length > 0) ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {todayTraining.map((training) => (
              <Link
                key={training.id}
                href="/athlete/entrenamiento"
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
              >
                {/* Cover colorido */}
                <div
                  className="h-32 w-full transition-opacity group-hover:opacity-90"
                  style={{
                    backgroundColor: training.activity?.color || '#6366f1',
                    backgroundImage: training.activity?.color
                      ? `linear-gradient(135deg, ${training.activity.color} 0%, ${training.activity.color}dd 100%)`
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                />
                
                {/* Contenido */}
                <div className="p-4">
                  {training.activity && (
                    <span
                      className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${training.activity.color}20`,
                        color: training.activity.color,
                      }}
                    >
                      {training.activity.name}
                    </span>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {training.title}
                  </h4>
                  {training.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {training.description}
                    </p>
                  )}
                  
                  {/* Footer con iconos */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {training.videoUrl && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        Video
                      </span>
                    )}
                    <span className="ml-auto font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400">
                      Ver →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">No hay entrenamientos programados para hoy</p>
            <Link
              href="/athlete/history"
              className="mt-4 inline-block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Ver Historial
            </Link>
          </div>
        )}
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximos Entrenamientos */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próximos Entrenamientos
            </h3>
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mañana</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Strength Day</p>
              </div>
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Miércoles</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">EMOM</p>
              </div>
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Jueves</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cardio</p>
              </div>
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Estado de Pago */}
        <div className={`rounded-xl p-6 shadow-lg dark:bg-gray-800 ${
          paymentStatus?.isNearExpiration || paymentStatus?.isExpired
            ? 'bg-red-50 border-2 border-red-500 dark:bg-red-900/20 dark:border-red-600'
            : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              paymentStatus?.isNearExpiration || paymentStatus?.isExpired
                ? 'text-red-900 dark:text-red-200'
                : 'text-gray-900 dark:text-white'
            }`}>
              Mi Cuota
            </h3>
            <svg className={`h-6 w-6 ${
              paymentStatus?.isNearExpiration || paymentStatus?.isExpired
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          
          {loadingPayment ? (
            <div className="mt-4 flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-600"></div>
            </div>
          ) : paymentStatus ? (
            <>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${
                    paymentStatus.isNearExpiration || paymentStatus.isExpired
                      ? 'text-red-900 dark:text-red-200'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatAmount(paymentStatus.amount)}
                  </p>
                  <span className={`text-sm ${
                    paymentStatus.isNearExpiration || paymentStatus.isExpired
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>/mes</span>
                </div>
                <p className={`mt-2 text-sm ${
                  paymentStatus.isNearExpiration || paymentStatus.isExpired
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Próximo pago: <span className={`font-medium ${
                    paymentStatus.isNearExpiration || paymentStatus.isExpired
                      ? 'text-red-900 dark:text-red-200'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {new Date(paymentStatus.nextPaymentDate).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </p>
                
                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {paymentStatus.isExpired ? (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                      <span className="text-red-700 dark:text-red-400 font-medium">Vencido</span>
                    </>
                  ) : paymentStatus.isNearExpiration ? (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                      <span className="text-orange-700 dark:text-orange-400 font-medium">
                        Vence en {paymentStatus.daysUntilDue} {paymentStatus.daysUntilDue === 1 ? 'día' : 'días'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-success-500"></span>
                      <span className="text-success-600 dark:text-success-400">Al día</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Warning message for near expiration */}
              {(paymentStatus.isNearExpiration || paymentStatus.isExpired) && (
                <div className="mt-4 rounded-lg bg-red-100 dark:bg-red-900/30 p-3 border border-red-300 dark:border-red-700">
                  <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                    {paymentStatus.isExpired 
                      ? 'Tu cuota está vencida. Por favor, realiza el pago lo antes posible.'
                      : 'Tu cuota vence pronto. Recuerda realizar el pago a tiempo.'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No se encontró información de pagos
              </p>
            </div>
          )}
        </div>

        {/* Mis Métricas */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mis Métricas
            </h3>
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Back Squat</span>
                <span className="font-semibold text-gray-900 dark:text-white">120 kg</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-brand-500" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Deadlift</span>
                <span className="font-semibold text-gray-900 dark:text-white">150 kg</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-brand-500" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Fran (min)</span>
                <span className="font-semibold text-gray-900 dark:text-white">4:32</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-success-500" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/20">
              <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Entrenamientos este mes</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-100 dark:bg-success-900/20">
              <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Asistencia</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-900/20">
              <svg className="h-6 w-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">PRs este mes</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-100 dark:bg-error-900/20">
              <svg className="h-6 w-6 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Días activo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mis Actividades (al final) */}
      <MyActivities />
      </>
      )}
    </div>
    </div>
  );
}
