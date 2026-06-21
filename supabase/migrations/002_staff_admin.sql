-- ============================================================
-- Migration 002: Staff & Admin additions
-- ============================================================

-- Add checked_in_at to reservasi for Check-in feature
ALTER TABLE public.reservasi
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL;

-- Add konfirmasi_staff_id to track who confirmed
ALTER TABLE public.reservasi
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.users(id) DEFAULT NULL;

-- Add is_available to meja (for Staff to toggle)
ALTER TABLE public.meja
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;

-- Update pembayaran: add verified_by and verified_at
ALTER TABLE public.pembayaran
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id) DEFAULT NULL;
ALTER TABLE public.pembayaran
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- RLS: Staff can read ALL reservasi, pembayaran, meja
-- ============================================================

-- Staff/Admin can update any reservasi
CREATE POLICY "Staff can update any reservasi" ON public.reservasi
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

-- Staff/Admin can update pembayaran
CREATE POLICY "Staff can update pembayaran" ON public.pembayaran
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

-- Staff/Admin can read all pembayaran
CREATE POLICY "Staff can read all pembayaran" ON public.pembayaran
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

-- Admin can manage meja
CREATE POLICY "Admin can manage meja" ON public.meja
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Staff can update meja (is_available)
CREATE POLICY "Staff can update meja" ON public.meja
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Staff', 'Admin')
    )
  );

-- Admin can manage users
CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

CREATE POLICY "Admin can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Admin can manage outlets
CREATE POLICY "Admin can manage outlets" ON public.outlets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Admin can insert meja
CREATE POLICY "Admin can insert meja" ON public.meja
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Admin can delete meja
CREATE POLICY "Admin can delete meja" ON public.meja
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );
