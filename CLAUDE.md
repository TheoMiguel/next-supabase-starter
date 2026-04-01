# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

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

- `.github/workflows/ci.yml`: corre en cada PR → typecheck + lint + vitest
- `.github/workflows/deploy.yml`: corre en push a `main` → E2E Playwright → deploy a Vercel

Secrets de GitHub requeridos: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
