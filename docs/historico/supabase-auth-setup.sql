-- ============================================================
-- Script de configuración de Auth + Profiles para BlackSheep
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'alumno' CHECK (role IN ('alumno', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Política: cada usuario ve y edita su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Política: el service role puede leer/escribir todo (para el middleware)
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Trigger: crear perfil automáticamente al registrar un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'alumno')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- INSTRUCCIONES PARA CREAR EL ADMIN:
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Clic en "Add user" → Email: b.sheep.la@gmail.com, Pass: bsh33p@la2025
-- 3. Luego ejecuta este SQL (reemplaza el UUID con el del usuario creado):
-- ============================================================

-- Crear perfil admin manualmente si no se disparó el trigger:
-- INSERT INTO public.profiles (id, role)
-- VALUES ('<UUID_DEL_USUARIO_ADMIN>', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- O actualizar el rol de un usuario existente:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<UUID_DEL_USUARIO_ADMIN>';
