-- ============================================================
-- Migration 004: Fix Reservasi Status & Policies
-- ============================================================

-- 1. Tambahkan status 'Menunggu Konfirmasi' ke ENUM reservasi_status
-- Karena di PostgreSQL tidak bisa langsung mengubah default sebelum value ada,
-- kita pakai ALTER TYPE. (Kecuali enum ini dipakai di column lain, ini aman)
ALTER TYPE reservasi_status ADD VALUE IF NOT EXISTS 'Menunggu Konfirmasi' BEFORE 'Mendatang';

-- 2. Ubah default status pada tabel reservasi
ALTER TABLE public.reservasi ALTER COLUMN status SET DEFAULT 'Menunggu Konfirmasi';

-- 3. Perbarui RLS pada tabel reservasi agar lebih eksplisit
-- Hapus policy lama
DROP POLICY IF EXISTS "Users can view own reservasi" ON public.reservasi;

-- Policy untuk Pelanggan (hanya bisa melihat miliknya sendiri)
CREATE POLICY "Pelanggan can view own reservasi" ON public.reservasi
  FOR SELECT USING ( auth.uid() = user_id );

-- Policy untuk Staff dan Admin (bisa melihat SEMUA reservasi)
CREATE POLICY "Staff and Admin can read all reservasi" ON public.reservasi
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );
