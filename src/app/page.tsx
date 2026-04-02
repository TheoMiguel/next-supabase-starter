import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/features/auth/lib/auth-utils";

async function RootRedirect() {
  const user = await getUser();
  redirect(user ? "/admin" : "/login");
}

export default function HomePage() {
  return (
    <Suspense>
      <RootRedirect />
    </Suspense>
  );
}
