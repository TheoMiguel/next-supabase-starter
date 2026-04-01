import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SinPermisosPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="text-muted-foreground">No tenés permisos para acceder a esta sección.</p>
      <Button asChild>
        <Link href="/login">Volver al inicio</Link>
      </Button>
    </div>
  );
}
