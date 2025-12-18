"use client";

import { useAuth } from "@/context/AuthContext";
import { useActiveAthleteActivities } from "@/lib/api/hooks/useActivities";
import { useAthleteId } from "@/lib/api/hooks/useAthleteId";

export default function MyActivities() {
  const { user } = useAuth();
  const { athleteId, loading: loadingAthleteId } = useAthleteId(user?.id);
  const { data: athleteActivities = [], isLoading } = useActiveAthleteActivities(athleteId || '');

  console.log('🔍 MyActivities Debug:', {
    userId: user?.id,
    athleteId,
    athleteActivities,
    isLoading,
    count: athleteActivities?.length || 0,
  });

  if (loadingAthleteId || isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Mis Actividades
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"></div>
        </div>
      </div>
    );
  }

  if (athleteActivities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tienes actividades asignadas
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Mis Actividades
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {athleteActivities.map((athleteActivity) => (
          <div
            key={athleteActivity.id}
            className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            style={{
              borderColor: athleteActivity.activity?.color ? `${athleteActivity.activity.color}40` : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: athleteActivity.activity?.color || '#9ca3af' }}
              >
                {athleteActivity.activity?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {athleteActivity.activity?.name || "Sin nombre"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Desde {new Date(athleteActivity.startDate).toLocaleDateString("es-AR", { month: 'short', year: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
