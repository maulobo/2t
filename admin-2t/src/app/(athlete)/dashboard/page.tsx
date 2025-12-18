"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AthleteDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          ¡Hola, {user?.email.split('@')[0]}!
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Aquí está tu resumen del día
        </p>
      </div>

      {/* WOD del Día - Hero Card */}
            {/* WOD Hero Card */}
      <Link href="/athlete/wod">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow">
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">WOD del Día</p>
                <p className="text-3xl font-bold">Murph</p>
              </div>
            </div>

            <div className="space-y-3 text-sm opacity-90">
              <p className="text-lg font-semibold">For Time:</p>
              <ul className="space-y-1 pl-5 list-disc">
                <li>1 Mile Run</li>
                <li>100 Pull-ups</li>
                <li>200 Push-ups</li>
                <li>300 Air Squats</li>
                <li>1 Mile Run</li>
              </ul>
              <p className="mt-4 text-xs italic">
                *Puedes partir las repeticiones como prefieras
              </p>
            </div>

            <div className="mt-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-blue-600 hover:bg-gray-100">
                Ver Detalles
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </Link>

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximos WODs */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próximos WODs
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mañana</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Strength Day</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Miércoles</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">EMOM</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Jueves</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cardio</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Pago */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mi Cuota
            </h3>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                $45.000
              </p>
              <span className="text-sm text-gray-600 dark:text-gray-400">/mes</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Próximo pago: <span className="font-medium text-gray-900 dark:text-white">5 de Nov</span>
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-success-500"></span>
              <span className="text-success-600 dark:text-success-400">Al día</span>
            </div>
          </div>
        </div>

        {/* Mis Métricas */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mis Métricas
            </h3>
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
            {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">WODs Completados</p>
              <p className="mt-2 text-3xl font-bold">24</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Asistencia</p>
              <p className="mt-2 text-3xl font-bold">92%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">PRs Este Mes</p>
              <p className="mt-2 text-3xl font-bold">5</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Días Activo</p>
              <p className="mt-2 text-3xl font-bold">18</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
