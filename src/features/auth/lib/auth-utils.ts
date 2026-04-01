import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { JwtPayload } from "@supabase/auth-js";
import type { Database } from "@/lib/supabase/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getUser(): Promise<JwtPayload | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims as JwtPayload) ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as JwtPayload | undefined;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .single();

  return profile ?? null;
}

export async function requireAuth(): Promise<JwtPayload> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/login?error=cuenta-desactivada");
  }

  if (profile.role !== role) {
    redirect("/sin-permisos");
  }

  return profile;
}
