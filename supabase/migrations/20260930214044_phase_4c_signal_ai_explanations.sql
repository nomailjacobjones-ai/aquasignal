/*
# Phase 4C — AI Evidence Explanation Layer

New table: signal_ai_explanations
  Stores AI-generated explanations of existing deterministic evidence chains.
  One current explanation per signal (unique on signal_id).
  RLS enabled, no-auth prototype: anon + authenticated CRUD.
  Does not store raw prompts or provider secrets.
*/

CREATE TABLE IF NOT EXISTS signal_ai_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES environmental_signals(id) ON DELETE CASCADE,
  summary text NOT NULL,
  supporting_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  uncertainties jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_review text,
  disclaimer text NOT NULL,
  provider text,
  model text,
  engine_type text NOT NULL DEFAULT 'llm',
  is_fallback boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One current explanation per signal
CREATE UNIQUE INDEX IF NOT EXISTS idx_sae_signal_id_unique
  ON signal_ai_explanations (signal_id);

CREATE INDEX IF NOT EXISTS idx_sae_created_at
  ON signal_ai_explanations (created_at);

ALTER TABLE signal_ai_explanations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signal_ai_explanations" ON signal_ai_explanations;
CREATE POLICY "anon_select_signal_ai_explanations"
  ON signal_ai_explanations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signal_ai_explanations" ON signal_ai_explanations;
CREATE POLICY "anon_insert_signal_ai_explanations"
  ON signal_ai_explanations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signal_ai_explanations" ON signal_ai_explanations;
CREATE POLICY "anon_update_signal_ai_explanations"
  ON signal_ai_explanations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signal_ai_explanations" ON signal_ai_explanations;
CREATE POLICY "anon_delete_signal_ai_explanations"
  ON signal_ai_explanations FOR DELETE
  TO anon, authenticated USING (true);
