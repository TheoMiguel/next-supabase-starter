"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/auth-utils";
import type { Database } from "@/lib/supabase/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function deactivateUser(userId: string) {
  const currentUser = await requireRole("super_admin");

  if (currentUser.id === userId) {
    return { error: "No podés desactivar tu propia cuenta" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false } as ProfileUpdate)
    .eq("id", userId);

  if (error) return { error: error.message };

  return { success: true };
}
