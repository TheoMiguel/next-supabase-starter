import { Suspense } from "react";
import { requireRole } from "@/features/auth/lib/auth-utils";
import { AppSidebar } from "@/features/admin/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

async function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("super_admin");

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <div className="flex min-h-svh flex-1 flex-col">{children}</div>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
