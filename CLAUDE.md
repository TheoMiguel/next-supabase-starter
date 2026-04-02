# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Partir un proyecto desde este template

Esta sección es para cuando este repo se clona como base de un proyecto nuevo.
Ejecutar los pasos en orden. Todos son realizables por un agente.

### Paso 1 — Renombrar referencias al template

Reemplazar `"Boilerplate Agencia"` y `"boilerplate"` con el nombre real del proyecto en:

- `src/app/layout.tsx` → `metadata.title` y `metadata.description`
- `package.json` → campo `"name"` (si se agrega)
- `README.md` → título y descripción
- `supabase/config.toml` → `project_id`

### Paso 2 — Cambiar el remote de git

El repo fue clonado desde el template. Apuntarlo al nuevo remote del proyecto:

```bash
git remote remove origin
git remote add origin https://github.com/ORG/NUEVO-REPO.git
git push -u origin main
```

### Paso 3 — Crear proyecto en Supabase

#### Opción A — Local (desarrollo sin cloud)

1. `npm install`
2. Levantar Supabase local (Docker):
   ```bash
   npx supabase start
   ```
3. Crear `.env.local` a partir de `.env.example` con los valores que imprime `supabase start`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL (ej. `http://127.0.0.1:54321`)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → Publishable key
   - `SUPABASE_SERVICE_ROLE_KEY` → Secret key
   - `RESEND_API_KEY` → placeholder (`re_placeholder_local`)
4. Verificar que las migrations estén aplicadas:
   ```bash
   npx supabase db push --local
   ```
5. Regenerar types:
   ```bash
   npx supabase gen types typescript --local 2>/dev/null > src/lib/supabase/database.types.ts
   ```

> **Nota:** `supabase start` ya aplica las migrations automáticamente. El paso 4 es solo para verificar.

#### Opción B — Cloud

1. Crear proyecto en https://supabase.com/dashboard
2. Copiar las keys desde Settings → API
3. Crear `.env.local` y `.env.cloud` desde `.env.example` con las keys reales
4. Aplicar el schema inicial:
   ```bash
   supabase link --project-ref TU_PROJECT_REF
   supabase db push
   ```
5. Regenerar types:
   ```bash
   supabase gen types typescript --linked 2>/dev/null > src/lib/supabase/database.types.ts
   ```
6. Configurar SMTP para usar Resend: Dashboard → Auth → SMTP Settings

### Paso 4 — Crear el primer SuperAdmin

```bash
# Local — no interactivo (recomendado para agentes):
ADMIN_EMAIL=admin@cliente.com ADMIN_PASSWORD=Password1234! ADMIN_FULL_NAME="Nombre Admin" npm run create-admin:local

# Cloud — no interactivo:
ADMIN_EMAIL=admin@cliente.com ADMIN_PASSWORD=Password1234! ADMIN_FULL_NAME="Nombre Admin" npm run create-admin:cloud

# Interactivo:
npm run create-admin:local   # o :cloud
```

### Paso 5 — Conectar Vercel

```bash
vercel link        # vincula el repo al proyecto de Vercel
vercel env pull    # opcional: baja las env vars de Vercel a .env.local
```

O desde el dashboard de Vercel: New Project → Import Git Repository.

### Paso 6 — Configurar secrets de GitHub

Ir a: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Secrets requeridos para que el CI/CD funcione:

| Secret                                 | Dónde obtenerlo                         |
| -------------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase → Settings → API               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API               |
| `SUPABASE_SERVICE_ROLE_KEY`            | Supabase → Settings → API               |
| `RESEND_API_KEY`                       | resend.com/api-keys                     |
| `VERCEL_TOKEN`                         | vercel.com/account/tokens               |
| `VERCEL_ORG_ID`                        | `vercel inspect` o dashboard → Settings |
| `VERCEL_PROJECT_ID`                    | `vercel inspect` o dashboard → Settings |

> Sin estos secrets el workflow `deploy.yml` se saltea automáticamente (no falla).
> El workflow `ci.yml` (typecheck, lint, tests) siempre corre con valores placeholder si los secrets no están.

### Paso 7 — Verificar

```bash
npm run typecheck
npm run test
npm run dev:local   # login con admin@cliente.com
```

---

## Commands

```bash
npm run dev:local    # Supabase start + Next.js con .env.local (recomendado para desarrollo)
npm run dev:cloud    # Next.js con .env.cloud (apunta a Supabase cloud)
npm run dev          # Next.js con .env.local (asume Supabase ya corriendo)
npm run build        # Build de producción
npm run typecheck    # TypeScript sin emit
npm run lint         # ESLint
npm run lint:fix     # ESLint con auto-fix
npm run format       # Prettier sobre todo el proyecto
npm run test         # Vitest (unit/integration), una sola corrida
npm run test:watch   # Vitest en modo watch
npm run test:e2e     # Playwright E2E (requiere servidor corriendo o usa webServer config)

# Primer usuario SuperAdmin
npm run create-admin:local   # interactivo, apunta a local
npm run create-admin:cloud   # interactivo, apunta a cloud
# No interactivo (para agentes):
# ADMIN_EMAIL=x ADMIN_PASSWORD=x ADMIN_FULL_NAME=x npm run create-admin:cloud

# Base de datos (local)
supabase start       # Levantar Supabase local (Docker) — se llama automáticamente en dev:local
supabase db reset    # Aplicar migrations + seed desde cero
supabase db diff     # Generar nueva migración a partir de cambios en el schema
supabase gen types typescript --local 2>/dev/null > src/lib/supabase/database.types.ts
```

---

## Architecture

### Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Supabase** — Auth + PostgreSQL con RLS
- **Vercel** — Hosting y CI/CD
- **shadcn/ui** + Tailwind CSS — UI
- **Resend** — Email transaccional

### Estructura de carpetas

```
src/
  app/                    # Rutas — wrappers finos que delegan a features/
    admin/                # Rutas protegidas (solo super_admin)
      layout.tsx          # Llama requireRole("super_admin"), monta AppSidebar
      page.tsx            # Dashboard con métricas placeholder
      usuarios/page.tsx   # CRUD de usuarios
    login/page.tsx
    recuperar-contrasena/page.tsx
    sin-permisos/page.tsx
    auth/                 # Rutas técnicas de Supabase (confirm, update-password, error)
  features/
    auth/
      lib/auth-utils.ts   # getUser, getProfile, requireAuth, requireRole
      components/         # LoginForm, ForgotPasswordForm, UpdatePasswordForm
    admin/
      components/         # AppSidebar, AdminHeader, SignOutButton, StatCard
    users/
      actions/            # getUsers, inviteUser, updateUser, deactivateUser
      components/         # UsersTable, InviteUserDialog, DeactivateUserDialog
    email/
      lib/resend.ts       # Cliente Resend inicializado desde env.ts
      actions/send-email.ts
      templates/          # React Email components
  lib/
    supabase/
      client.ts           # createClient() — browser (cookie-based)
      server.ts           # createClient() — server components (cookie-based)
      admin.ts            # createAdminClient() — service role key, solo server
      database.types.ts   # Generado por Supabase CLI, no editar a mano
  components/ui/          # Primitivos shadcn (no modificar)
  env.ts                  # Validación Zod de env vars — importar en lugar de process.env
  test/
    setup.ts
    utils.tsx             # customRender con providers
e2e/                      # Tests Playwright
supabase/
  migrations/             # SQL versionado — aplicar con supabase db push
  seed.sql                # Usuario admin de desarrollo
```

### Patrones clave

**Tres clientes Supabase:**

- `@/lib/supabase/client` — para Client Components (browser)
- `@/lib/supabase/server` — para Server Components y Server Actions
- `@/lib/supabase/admin` — para operaciones de administración (usa `SUPABASE_SERVICE_ROLE_KEY`). Nunca importar en código de cliente.

**Autorización en dos capas:**

1. `proxy.ts` (middleware Fluid compute): refresca sesión y redirige `/admin/*` si no hay usuario
2. `requireRole("super_admin")` en `src/app/admin/layout.tsx`: verifica el rol del perfil y redirige a `/sin-permisos` si no coincide

**Variables de entorno:**
Siempre importar `env` desde `@/env` en lugar de usar `process.env` directamente. El schema Zod valida y tipea todas las variables al arrancar la app.

**Server Actions como default:**
Usar Server Actions para mutaciones CRUD. API Routes (`app/api/`) solo para endpoints externos (webhooks, integraciones con terceros).

**Feature modules:**
Cada feature (`auth`, `admin`, `users`, `email`) contiene sus propias actions, components y lib. Las páginas en `app/` son wrappers finos — no deben tener lógica de negocio directa.

### Roles

Solo `super_admin` en el boilerplate base. Para agregar nuevos roles en un proyecto:

1. `ALTER TYPE user_role ADD VALUE 'nuevo_rol';` en una nueva migración
2. Actualizar `database.types.ts` (o regenerar con Supabase CLI)
3. Agregar el rol a `requireRole` calls donde sea necesario

### Migraciones

Crear nuevas migraciones con `supabase db diff --file nombre_migracion` o escribir SQL en `supabase/migrations/` con formato `NNNNN_descripcion.sql`. Aplicar con `supabase db push` (local) o automáticamente en CI.

### Email

`features/email/lib/resend.ts` exporta el cliente Resend. `features/email/actions/send-email.ts` es el wrapper server action. Configurar el SMTP de Supabase para usar Resend en: Dashboard → Auth → SMTP Settings.

### CI/CD

- `.github/workflows/ci.yml`: corre en cada PR → typecheck + lint + vitest. Usa placeholders si los secrets no están configurados (compatible con el template sin infraestructura).
- `.github/workflows/deploy.yml`: corre en push a `main` → E2E Playwright → deploy a Vercel. **Se saltea automáticamente si `VERCEL_TOKEN` no está configurado.**
