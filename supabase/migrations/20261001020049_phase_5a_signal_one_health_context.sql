/*
# Phase 5A — One Health Context Layer

New table: signal_one_health_context
  Stores deterministic One Health context statements for environmental signals.
  One context per signal (unique on signal_id).
  RLS enabled, no-auth prototype: anon + authenticated CRUD.
  Does NOT store medical records, personal health info, or patient data.
*/

CREATE TABLE IF NOT EXISTS signal_one_health_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES environmental_signals(id) ON DELETE CASCADE,
  ecosystem_context text NOT NULL,
  biodiversity_context text NOT NULL,
  human_wellbeing_context text NOT NULL,
  context_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  disclaimer text NOT NULL,
  engine_type text NOT NULL DEFAULT 'rules',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ohc_signal_id_unique
  ON signal_one_health_context (signal_id);

ALTER TABLE signal_one_health_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signal_one_health_context" ON signal_one_health_context;
CREATE POLICY "anon_select_signal_one_health_context"
  ON signal_one_health_context FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signal_one_health_context" ON signal_one_health_context;
CREATE POLICY "anon_insert_signal_one_health_context"
  ON signal_one_health_context FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signal_one_health_context" ON signal_one_health_context;
CREATE POLICY "anon_update_signal_one_health_context"
  ON signal_one_health_context FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signal_one_health_context" ON signal_one_health_context;
CREATE POLICY "anon_delete_signal_one_health_context"
  ON signal_one_health_context FOR DELETE
  TO anon, authenticated USING (true);
