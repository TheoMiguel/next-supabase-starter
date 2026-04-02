-- ================================================================
-- MIGRACIÓN 00001: Schema inicial del boilerplate
-- ================================================================

-- Enum de roles (solo super_admin en el boilerplate base)
-- Para agregar nuevos roles en proyectos específicos:
--   ALTER TYPE user_role ADD VALUE 'nuevo_rol';
create type user_role as enum ('super_admin');

-- ----------------------------------------------------------------
-- Tabla profiles
-- Extiende auth.users de Supabase con datos de la aplicación
-- ----------------------------------------------------------------
create table profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  email       text        not null,
  full_name   text,
  role        user_role   not null default 'super_admin',
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- Función: verificar si el usuario actual es super_admin
-- SECURITY DEFINER para bypassear RLS y evitar recursión infinita
-- cuando las policies de profiles necesitan consultar profiles
-- ----------------------------------------------------------------
create or replace function is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'super_admin' and is_active = true
  );
end;
$$;

-- ----------------------------------------------------------------
-- RLS (Row Level Security)
-- ----------------------------------------------------------------
alter table profiles enable row level security;

-- Un usuario puede ver su propio perfil
create policy "Usuarios pueden ver su propio perfil"
  on profiles for select
  using (auth.uid() = id);

-- SuperAdmin puede ver todos los perfiles
create policy "SuperAdmin puede ver todos los perfiles"
  on profiles for select
  using (is_super_admin());

-- SuperAdmin puede actualizar cualquier perfil
create policy "SuperAdmin puede actualizar perfiles"
  on profiles for update
  using (is_super_admin());

-- ----------------------------------------------------------------
-- Función: auto-crear perfil al registrar usuario
-- ----------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ----------------------------------------------------------------
-- Función: actualizar updated_at automáticamente
-- ----------------------------------------------------------------
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- ----------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------
create index profiles_role_idx on profiles(role);
create index profiles_is_active_idx on profiles(is_active);
