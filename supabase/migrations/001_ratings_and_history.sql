-- ============================================================
-- Migration 001 — Reviews, notifications, performer history
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── Reviews table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      text NOT NULL,
  client_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performer_id  uuid,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- One review per order
CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_id_key ON reviews(order_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_insert"  ON reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "reviews_select"  ON reviews FOR SELECT USING (auth.uid() = client_id OR auth.uid() = performer_id);

-- ─── Notifications table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL DEFAULT 'info',
  title       text NOT NULL DEFAULT '',
  body        text NOT NULL DEFAULT '',
  order_id    text,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert (enables cross-session writes)
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ─── Trigger: recalculate performer rating on new review ───
CREATE OR REPLACE FUNCTION recalculate_performer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performer_profiles
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE performer_id = NEW.performer_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.performer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_performer_rating ON reviews;
CREATE TRIGGER trigger_performer_rating
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_performer_rating();

-- ─── Missing columns on order_history ──────────────────────
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS assigned_at              timestamptz;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS completion_comment        text;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS completion_requested_at   timestamptz;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS client_confirmed_at       timestamptz;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS client_rating             int;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS client_review             text;

-- ─── Missing columns on shared_orders ──────────────────────
ALTER TABLE shared_orders ADD COLUMN IF NOT EXISTS client_rating  int;
ALTER TABLE shared_orders ADD COLUMN IF NOT EXISTS client_review  text;
