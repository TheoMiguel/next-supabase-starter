# Agency Boilerplate — Next.js + Supabase

Boilerplate base para proyectos B2B de la agencia. Incluye auth, RBAC, back office y CI/CD listos para extender.

**Stack:** Next.js 16 (App Router) · Supabase · Vercel · shadcn/ui · Resend

## Setup inicial

### 1. Variables de entorno

Hay dos archivos de entorno según dónde corre la base de datos:

```bash
cp .env.example .env.local   # para desarrollo local (Supabase CLI + Docker)
cp .env.example .env.cloud   # para apuntar a Supabase cloud
```

Ambos siguen la misma estructura. Completar con las keys correspondientes:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → Dashboard Supabase → Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` → Dashboard Supabase → Settings → API → service_role
- `RESEND_API_KEY` → resend.com/api-keys

Para `.env.local`, las keys locales las imprime `supabase start` al terminar.

### 2. Desarrollo local (recomendado)

Requiere [Supabase CLI](https://supabase.com/docs/guides/cli) y Docker.

```bash
npm install

# Primera vez: aplicar migrations y crear usuario admin de desarrollo
supabase db reset   # crea admin@boilerplate.local / Admin1234!

# Levantar todo (Supabase + Next.js)
npm run dev:local
```

`dev:local` corre `supabase start` (si ya está corriendo es instantáneo) y luego `next dev` con `.env.local`.

### 3. Desarrollo contra Supabase cloud

```bash
npm run dev:cloud   # usa .env.cloud
```

---

## Comandos de desarrollo

| Comando                          | Descripción                                            |
| -------------------------------- | ------------------------------------------------------ |
| `npm run dev:local`              | Levanta Supabase local + Next.js                       |
| `npm run dev:cloud`              | Next.js apuntando a Supabase cloud                     |
| `npm run dev`                    | Next.js con `.env.local` (asume Supabase ya corriendo) |
| `supabase db reset`              | Borra y recrea la DB local con migrations + seed       |
| `supabase db diff --file nombre` | Genera migración a partir de cambios en el schema      |

---

## Crear el primer SuperAdmin

```bash
# Local
npm run create-admin:local

# Cloud (producción / staging)
npm run create-admin:cloud

# Con variables de entorno (no interactivo — útil para agentes)
ADMIN_EMAIL=admin@empresa.com ADMIN_PASSWORD=Pass1234! ADMIN_FULL_NAME="Juan Pérez" npm run create-admin:cloud
```

El script crea el usuario directamente via Supabase Admin API (no requiere verificación de email) y el trigger de la DB asigna el rol `super_admin` automáticamente.

---

## Nuevo proyecto desde este boilerplate

1. Clonar el repo y renombrar referencias a "boilerplate" en `CLAUDE.md`, `package.json` y `src/app/layout.tsx`
2. Crear proyecto en Supabase y Vercel
3. Configurar `.env.local` (local) y `.env.cloud` (cloud)
4. Configurar SMTP en Supabase para usar Resend: Dashboard → Auth → SMTP Settings
5. Agregar secrets al repositorio de GitHub (ver `CLAUDE.md` → CI/CD)
6. Generar types actualizados: `supabase gen types typescript --linked > src/lib/supabase/database.types.ts`

## Agregar un nuevo rol

1. Crear migración: `supabase db diff --file add_nuevo_rol`
2. En el SQL: `ALTER TYPE user_role ADD VALUE 'nuevo_rol';`
3. Regenerar types: `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
4. Actualizar RLS policies en Supabase si corresponde
5. Usar `requireRole('nuevo_rol')` en los layouts de las rutas protegidas
