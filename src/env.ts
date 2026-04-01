import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const _serverEnv = serverSchema.safeParse(process.env);
const _clientEnv = clientSchema.safeParse(process.env);

if (!_serverEnv.success) {
  console.error(
    "❌ Variables de entorno del servidor inválidas:",
    _serverEnv.error.flatten().fieldErrors,
  );
  throw new Error("Variables de entorno del servidor inválidas");
}

if (!_clientEnv.success) {
  console.error(
    "❌ Variables de entorno del cliente inválidas:",
    _clientEnv.error.flatten().fieldErrors,
  );
  throw new Error("Variables de entorno del cliente inválidas");
}

export const env = {
  ..._serverEnv.data,
  ..._clientEnv.data,
};
