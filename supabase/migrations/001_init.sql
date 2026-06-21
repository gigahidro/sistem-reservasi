-- ============================================================
-- PTIK YUMFOOD - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('Pelanggan', 'Staff', 'Admin');
CREATE TYPE reservasi_status AS ENUM ('Mendatang', 'Selesai', 'Dibatalkan');

-- ============================================================
-- TABLE: users (public profile, mirrors auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL DEFAULT '',
  username VARCHAR(100) UNIQUE NOT NULL DEFAULT '',
  email VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'Pelanggan',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: pelanggan_profiles (1:1 with users where role=Pelanggan)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pelanggan_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  telepon VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: staff_profiles (1:1 with users where role=Staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  shift VARCHAR(50),
  jabatan VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: outlets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outlets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_outlet VARCHAR(255) NOT NULL,
  lokasi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: meja
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  nomor VARCHAR(50) NOT NULL,
  kapasitas INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reservasi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reservasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meja_id UUID NOT NULL REFERENCES public.meja(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  sesi VARCHAR(100) NOT NULL,
  jumlah_orang INTEGER NOT NULL DEFAULT 1,
  status reservasi_status NOT NULL DEFAULT 'Mendatang',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: pembayaran
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pembayaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservasi_id UUID NOT NULL REFERENCES public.reservasi(id) ON DELETE CASCADE,
  jumlah_dp NUMERIC(12,2) NOT NULL DEFAULT 0,
  bukti_pembayaran TEXT,
  status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifikasi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifikasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservasi_id UUID NOT NULL REFERENCES public.reservasi(id) ON DELETE CASCADE,
  tipe VARCHAR(50) NOT NULL,
  pesan TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: Auto-create user profile after auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, nama, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    'Pelanggan'
  );

  -- Also create pelanggan_profile
  INSERT INTO public.pelanggan_profiles (id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;

-- users: can read own, admin reads all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- pelanggan_profiles: own only
CREATE POLICY "Pelanggan can view own profile" ON public.pelanggan_profiles
  FOR ALL USING (auth.uid() = id);

-- outlets: everyone can read
CREATE POLICY "Outlets are publicly readable" ON public.outlets
  FOR SELECT USING (true);

-- meja: everyone can read
CREATE POLICY "Meja are publicly readable" ON public.meja
  FOR SELECT USING (true);

-- reservasi: users see own, staff/admin see all
CREATE POLICY "Users can view own reservasi" ON public.reservasi
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

CREATE POLICY "Users can insert own reservasi" ON public.reservasi
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservasi" ON public.reservasi
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

-- pembayaran: own reservasi only
CREATE POLICY "Users can view own pembayaran" ON public.pembayaran
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservasi r
      WHERE r.id = reservasi_id AND r.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

CREATE POLICY "Users can insert own pembayaran" ON public.pembayaran
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservasi r
      WHERE r.id = reservasi_id AND r.user_id = auth.uid()
    )
  );

-- notifikasi: own reservasi only
CREATE POLICY "Users can view own notifikasi" ON public.notifikasi
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservasi r
      WHERE r.id = reservasi_id AND r.user_id = auth.uid()
    )
  );

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert outlet
INSERT INTO public.outlets (id, nama_outlet, lokasi) VALUES
  ('00000000-0000-0000-0000-000000000001', 'PTIK Resto Solo', 'Jl. Ahmad Yani No. 1, Solo, Jawa Tengah');

-- Insert meja for PTIK Resto Solo
INSERT INTO public.meja (outlet_id, nomor, kapasitas) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Meja 1', 4),
  ('00000000-0000-0000-0000-000000000001', 'Meja 2', 4),
  ('00000000-0000-0000-0000-000000000001', 'Meja 3', 4),
  ('00000000-0000-0000-0000-000000000001', 'Meja 4', 4),
  ('00000000-0000-0000-0000-000000000001', 'Meja 5', 4),
  ('00000000-0000-0000-0000-000000000001', 'Meja 6', 4);
