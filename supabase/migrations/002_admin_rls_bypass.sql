-- ============================================================
-- Migration 002 — Fix is_admin() to include 'admin' role
-- Fixes: affiliate manager dropdown empty in task creation modal
-- Root cause: is_admin() was missing 'admin' role — admins couldn't
--   read other users' profiles via admins_read_all_profiles policy
-- APPLIED to production 2026-06-04 via Management API
-- ============================================================

-- Fix: add 'admin' to is_admin() role list
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'support_admin', 'finance_admin', 'verifier', 'operator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- affiliate_tasks: ensure admin can manage all tasks
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'affiliate_tasks' AND n.nspname = 'public'
  ) THEN
    ALTER TABLE affiliate_tasks ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "affiliate_tasks_admin_all" ON affiliate_tasks;
    CREATE POLICY "affiliate_tasks_admin_all" ON affiliate_tasks
      FOR ALL
      USING (is_admin());
  END IF;
END $$;
