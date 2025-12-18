"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CreateAthleteForm from "@/components/athletes/CreateAthleteForm";
import { Athlete } from "@/types/athlete";

export default function CreateAthletePage() {
  const router = useRouter();

  const handleAthleteCreated = (newAthlete: Athlete) => {
    console.log("Atleta creado:", newAthlete);
    // Redirigir a la lista de atletas o a la página de detalles del atleta
    router.push("/atletas");
  };

  const handleCancel = () => {
    router.push("/atletas");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Crear Atleta" />

      <div className="mx-auto max-w-2xl">
        <ComponentCard 
          title="Información del Atleta"
          desc="Completa los datos para crear un nuevo atleta en el sistema"
        >
          <CreateAthleteForm
            onSuccess={handleAthleteCreated}
            onCancel={handleCancel}
            // coachId se obtendrá del contexto de usuario cuando esté disponible
          />
        </ComponentCard>
      </div>
    </div>
  );
}