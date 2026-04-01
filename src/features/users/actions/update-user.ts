"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/auth-utils";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const updateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export async function updateUser(input: z.infer<typeof updateSchema>) {
  await requireRole("super_admin");

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { id, ...updates } = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update(updates as ProfileUpdate)
    .eq("id", id);

  if (error) return { error: error.message };

  return { success: true };
}
