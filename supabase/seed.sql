-- ================================================================
-- SEED: Datos iniciales para desarrollo local
-- ================================================================
-- Crea un usuario SuperAdmin para desarrollo local.
-- Contraseña: Admin1234!
-- IMPORTANTE: No ejecutar en producción.
-- ================================================================

-- Insertar usuario en auth.users directamente (solo para desarrollo local)
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@boilerplate.local',
  crypt('Admin1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Super Admin"}',
  false,
  'authenticated'
);
