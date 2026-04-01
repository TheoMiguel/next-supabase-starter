#!/usr/bin/env tsx
/**
 * Crea el primer usuario SuperAdmin en el proyecto.
 *
 * Uso:
 *   npm run create-admin                          # interactivo
 *   npm run create-admin:local                    # usa .env.local
 *   npm run create-admin:cloud                    # usa .env.cloud
 *
 * O con argumentos directos:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=Pass1234! npm run create-admin:cloud
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

// ---------------------------------------------------------------------------
// Env vars (ya cargadas por dotenv-cli desde el script de npm)
// ---------------------------------------------------------------------------
const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Error: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Usá npm run create-admin:local o npm run create-admin:cloud.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptPassword(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  process.stdout.write(question);
  process.stdin.setRawMode?.(true);

  return new Promise((resolve) => {
    let password = "";
    process.stdin.on("data", (char: Buffer) => {
      const c = char.toString();
      if (c === "\r" || c === "\n") {
        process.stdin.setRawMode?.(false);
        process.stdout.write("\n");
        rl.close();
        resolve(password);
      } else if (c === "\u0003") {
        process.exit();
      } else if (c === "\u007f") {
        password = password.slice(0, -1);
      } else {
        password += c;
        process.stdout.write("*");
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("\n── Crear SuperAdmin ──────────────────────────────");
  console.log(`Supabase: ${supabaseUrl}\n`);

  const email = process.env["ADMIN_EMAIL"] ?? (await prompt("Email: "));

  const fullName = process.env["ADMIN_FULL_NAME"] ?? (await prompt("Nombre completo (opcional): "));

  const password =
    process.env["ADMIN_PASSWORD"] ?? (await promptPassword("Contraseña (mín. 8 caracteres): "));

  if (!email || !password) {
    console.error("\nError: email y contraseña son requeridos.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\nError: la contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  console.log("\nCreando usuario...");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || undefined },
  });

  if (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n✓ SuperAdmin creado correctamente`);
  console.log(`  ID:    ${data.user.id}`);
  console.log(`  Email: ${data.user.email}`);
  console.log(`  Rol:   super_admin (asignado por trigger)\n`);
}

main();
