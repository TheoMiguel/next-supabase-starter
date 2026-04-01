"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/auth-utils";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(1, "El nombre es requerido").optional(),
});

export async function inviteUser(formData: FormData) {
  await requireRole("super_admin");

  const input = inviteSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name") || undefined,
  });

  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.inviteUserByEmail(input.data.email, {
    data: { full_name: input.data.full_name },
  });

  if (error) return { error: error.message };

  return { success: true };
}
