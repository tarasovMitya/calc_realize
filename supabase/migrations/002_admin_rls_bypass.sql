-- ============================================================
-- Migration 002 — Admin bypass for profiles RLS
-- Fixes: affiliate managers not showing in task creation dropdown
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Helper: returns current user's role bypassing RLS (security definer = runs as owner, no RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admin bypass: allow admin/super_admin to read all profiles
-- (existing "profiles_select" policy still covers own-row access)
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- ─── affiliate_tasks: admins can manage, managers can read their own ──────────
-- (only needed if affiliate_tasks has RLS enabled; skip if not)
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
      USING (public.get_my_role() IN ('admin', 'super_admin'));

    DROP POLICY IF EXISTS "affiliate_tasks_manager_select" ON affiliate_tasks;
    CREATE POLICY "affiliate_tasks_manager_select" ON affiliate_tasks
      FOR SELECT
      USING (
        public.get_my_role() = 'affiliate_manager'
        AND (target = 'all' OR target = auth.uid()::text)
      );
  END IF;
END $$;
