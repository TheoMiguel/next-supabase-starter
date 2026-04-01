import { AdminHeader } from "@/features/admin/components/admin-header";
import { StatCard } from "@/features/admin/components/stat-card";
import { Users, Activity, TrendingUp, Database } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Usuarios totales"
            value="—"
            description="Usuarios registrados en el sistema"
            icon={Users}
          />
          <StatCard
            title="Usuarios activos"
            value="—"
            description="Activos en los últimos 30 días"
            icon={Activity}
          />
          <StatCard
            title="Métrica 3"
            value="—"
            description="Descripción de la métrica"
            icon={TrendingUp}
          />
          <StatCard
            title="Métrica 4"
            value="—"
            description="Descripción de la métrica"
            icon={Database}
          />
        </div>
      </main>
    </>
  );
}
