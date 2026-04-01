import { requireRole } from "@/features/auth/lib/auth-utils";
import { AppSidebar } from "@/features/admin/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("super_admin");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar profile={profile} />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </SidebarProvider>
  );
}
