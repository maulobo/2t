import type { Metadata } from "next";
import { AthletesMetrics } from "@/components/athletes/AthletesMetrics";
import React from "react";
import MonthlyRevenue from "@/components/athletes/MonthlyRevenue";
import RecentPayments from "@/components/athletes/RecentPayments";
import DemographicCard from "@/components/ecommerce/DemographicCard";

import AthleteGrowthChart from "@/components/dashboard/AthleteGrowthChart";
import RetentionMetrics from "@/components/dashboard/RetentionMetrics";

export const metadata: Metadata = {
  title:
    "Dashboard Atletas | Admin 2T",
  description: "Dashboard de gestión de atletas y pagos",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      {/* Métricas de Retención y Conversión */}
      <div className="col-span-12">
        <RetentionMetrics />
    </div>
    
      <div className="col-span-12">
        <RecentPayments />
      </div>

      {/* Métricas de Atletas */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <AthletesMetrics />

        {/* <MonthlySalesChart /> */}
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyRevenue />
      </div>

      {/* Gráfico de Crecimiento de Atletas */}
      <div className="col-span-12 xl:col-span-7">
        <AthleteGrowthChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

       {/* <div className="col-span-12">
         <StatisticsChart />
       </div> */}

    </div>
  );
}
