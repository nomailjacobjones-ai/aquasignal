/*
# Phase 4D — Human Review & Action Centre

New table: signal_reviews
  Stores human review decisions for deterministic environmental signals.
  One current review per signal (unique on signal_id).
  RLS enabled, no-auth prototype: anon + authenticated CRUD.
  Does NOT modify environmental_signals or any evidence data.
*/

CREATE TABLE IF NOT EXISTS signal_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES environmental_signals(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('confirmed_for_follow_up', 'needs_more_evidence', 'dismissed')),
  notes text,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One current review per signal
CREATE UNIQUE INDEX IF NOT EXISTS idx_sr_signal_id_unique
  ON signal_reviews (signal_id);

CREATE INDEX IF NOT EXISTS idx_sr_decision
  ON signal_reviews (decision);

CREATE INDEX IF NOT EXISTS idx_sr_reviewed_at
  ON signal_reviews (reviewed_at);

ALTER TABLE signal_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signal_reviews" ON signal_reviews;
CREATE POLICY "anon_select_signal_reviews"
  ON signal_reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signal_reviews" ON signal_reviews;
CREATE POLICY "anon_insert_signal_reviews"
  ON signal_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signal_reviews" ON signal_reviews;
CREATE POLICY "anon_update_signal_reviews"
  ON signal_reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signal_reviews" ON signal_reviews;
CREATE POLICY "anon_delete_signal_reviews"
  ON signal_reviews FOR DELETE
  TO anon, authenticated USING (true);
