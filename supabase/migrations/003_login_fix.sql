-- Fix untuk masalah Login (Username tidak ditemukan)
-- Mengizinkan akses baca (SELECT) publik ke tabel users agar halaman login bisa mencari email berdasarkan username

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Users can view own profile and public read for login" ON public.users
  FOR SELECT USING (true);
