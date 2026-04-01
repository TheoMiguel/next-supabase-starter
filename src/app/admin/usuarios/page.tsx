import { AdminHeader } from "@/features/admin/components/admin-header";
import { UsersTable } from "@/features/users/components/users-table";
import { getUsers } from "@/features/users/actions/get-users";
import { getUser } from "@/features/auth/lib/auth-utils";

export default async function UsuariosPage() {
  const [users, currentUser] = await Promise.all([getUsers(), getUser()]);

  return (
    <>
      <AdminHeader title="Usuarios" />
      <main className="flex-1 space-y-4 p-6">
        <UsersTable users={users} currentUserId={currentUser?.sub ?? ""} />
      </main>
    </>
  );
}
