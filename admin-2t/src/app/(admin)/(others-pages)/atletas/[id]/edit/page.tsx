"use client";

import { useParams, useRouter } from "next/navigation";
import { useAthlete } from "@/lib/api/hooks/useAthletes";
import EditAthleteForm from "@/components/athletes/EditAthleteForm";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function EditAthletePage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  // Cargar datos del atleta
  const { data: athlete, isLoading, error } = useAthlete(athleteId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <h2 className="mb-2 text-xl font-semibold text-red-600 dark:text-red-400">
            Error al cargar atleta
          </h2>
          <p className="text-red-500 dark:text-red-300">
            {error instanceof Error ? error.message : "No se encontró el atleta"}
          </p>
          <button
            onClick={() => router.push("/atletas")}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Volver a atletas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageBreadCrumb
        title="Editar Atleta"
        items={[
          { label: "Atletas", href: "/atletas" },
          { label: athlete.fullName, href: `/atletas/${athlete.id}` },
          { label: "Editar" },
        ]}
      />

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar {athlete.fullName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Actualiza la información del atleta
          </p>
        </div>

        <EditAthleteForm
          athlete={athlete}
          onSuccess={() => {
            router.push(`/atletas/${athlete.id}`);
          }}
          onCancel={() => {
            router.push(`/atletas/${athlete.id}`);
          }}
        />
      </div>
    </div>
  );
}
