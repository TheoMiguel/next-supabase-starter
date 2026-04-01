import { redirect } from "next/navigation";
import { getUser } from "@/features/auth/lib/auth-utils";

export default async function HomePage() {
  const user = await getUser();
  redirect(user ? "/admin" : "/login");
}
