/*
# Phase 4A — Evidence Chain Backend

1. New Tables
- observation_quality_checks
    Persists the result of the existing Phase 3 rule-based quality gate.
    Linked to observations via FK with ON DELETE CASCADE.
    Stores overall_status (ready / needs_clarification / insufficient_information),
    completeness (0–100), issues, clarification_questions, evidence_observations,
    explanation, and engine_type (defaults to 'rules').
- environmental_signals
    Represents a derived environmental observation pattern.
    Linked to sites via FK. Stores signal_type, title, description, status
    (emerging / monitoring / resolved / dismissed), strength (0–100),
    observation_count, indicator_count, time_window_hours, first/last_observed_at,
    reasoning (jsonb array), is_demo flag.
- signal_observations
    Traceability link between an environmental signal and the exact observations
    that contributed to it. Unique constraint on (signal_id, observation_id).
    contribution_type: primary / corroborating / contextual.
- signal_evidence
    Explicit explainable evidence attached to a signal.
    evidence_type: observation_count / time_cluster / indicator / photo / quality_check.
    source_observation_id links back to observations with ON DELETE SET NULL.

2. Indexes
- observation_quality_checks: observation_id, created_at
- environmental_signals: site_id, status, created_at, last_observed_at
- signal_observations: signal_id, observation_id
- signal_evidence: signal_id, source_observation_id

3. Security
- RLS enabled on all four new tables.
- No-auth prototype: anon + authenticated CRUD (data is intentionally public).
- 4 separate policies per table (SELECT, INSERT, UPDATE, DELETE).
- Does not weaken RLS on existing tables.
*/

-- =========================================================
-- 1. observation_quality_checks
-- =========================================================

CREATE TABLE IF NOT EXISTS observation_quality_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  overall_status text NOT NULL CHECK (
    overall_status IN ('ready', 'needs_clarification', 'insufficient_information')
  ),
  completeness integer NOT NULL CHECK (completeness >= 0 AND completeness <= 100),
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  clarification_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_observations jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation text,
  engine_type text NOT NULL DEFAULT 'rules',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oqc_observation_id
  ON observation_quality_checks (observation_id);
CREATE INDEX IF NOT EXISTS idx_oqc_created_at
  ON observation_quality_checks (created_at);

ALTER TABLE observation_quality_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_observation_quality_checks" ON observation_quality_checks;
CREATE POLICY "anon_select_observation_quality_checks"
  ON observation_quality_checks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_observation_quality_checks" ON observation_quality_checks;
CREATE POLICY "anon_insert_observation_quality_checks"
  ON observation_quality_checks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_observation_quality_checks" ON observation_quality_checks;
CREATE POLICY "anon_update_observation_quality_checks"
  ON observation_quality_checks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_observation_quality_checks" ON observation_quality_checks;
CREATE POLICY "anon_delete_observation_quality_checks"
  ON observation_quality_checks FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- 2. environmental_signals
-- =========================================================

CREATE TABLE IF NOT EXISTS environmental_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id),
  signal_type text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'emerging' CHECK (
    status IN ('emerging', 'monitoring', 'resolved', 'dismissed')
  ),
  strength integer NOT NULL CHECK (strength >= 0 AND strength <= 100),
  observation_count integer NOT NULL DEFAULT 0,
  indicator_count integer NOT NULL DEFAULT 0,
  time_window_hours integer NOT NULL,
  first_observed_at timestamptz,
  last_observed_at timestamptz,
  reasoning jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_es_site_id
  ON environmental_signals (site_id);
CREATE INDEX IF NOT EXISTS idx_es_status
  ON environmental_signals (status);
CREATE INDEX IF NOT EXISTS idx_es_created_at
  ON environmental_signals (created_at);
CREATE INDEX IF NOT EXISTS idx_es_last_observed_at
  ON environmental_signals (last_observed_at);

ALTER TABLE environmental_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_environmental_signals" ON environmental_signals;
CREATE POLICY "anon_select_environmental_signals"
  ON environmental_signals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_environmental_signals" ON environmental_signals;
CREATE POLICY "anon_insert_environmental_signals"
  ON environmental_signals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_environmental_signals" ON environmental_signals;
CREATE POLICY "anon_update_environmental_signals"
  ON environmental_signals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_environmental_signals" ON environmental_signals;
CREATE POLICY "anon_delete_environmental_signals"
  ON environmental_signals FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- 3. signal_observations
-- =========================================================

CREATE TABLE IF NOT EXISTS signal_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES environmental_signals(id) ON DELETE CASCADE,
  observation_id uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  contribution_type text CHECK (
    contribution_type IS NULL OR contribution_type IN ('primary', 'corroborating', 'contextual')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (signal_id, observation_id)
);

CREATE INDEX IF NOT EXISTS idx_so_signal_id
  ON signal_observations (signal_id);
CREATE INDEX IF NOT EXISTS idx_so_observation_id
  ON signal_observations (observation_id);

ALTER TABLE signal_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signal_observations" ON signal_observations;
CREATE POLICY "anon_select_signal_observations"
  ON signal_observations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signal_observations" ON signal_observations;
CREATE POLICY "anon_insert_signal_observations"
  ON signal_observations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signal_observations" ON signal_observations;
CREATE POLICY "anon_update_signal_observations"
  ON signal_observations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signal_observations" ON signal_observations;
CREATE POLICY "anon_delete_signal_observations"
  ON signal_observations FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- 4. signal_evidence
-- =========================================================

CREATE TABLE IF NOT EXISTS signal_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES environmental_signals(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  label text NOT NULL,
  value text,
  source_observation_id uuid REFERENCES observations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_se_signal_id
  ON signal_evidence (signal_id);
CREATE INDEX IF NOT EXISTS idx_se_source_observation_id
  ON signal_evidence (source_observation_id);

ALTER TABLE signal_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signal_evidence" ON signal_evidence;
CREATE POLICY "anon_select_signal_evidence"
  ON signal_evidence FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signal_evidence" ON signal_evidence;
CREATE POLICY "anon_insert_signal_evidence"
  ON signal_evidence FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signal_evidence" ON signal_evidence;
CREATE POLICY "anon_update_signal_evidence"
  ON signal_evidence FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signal_evidence" ON signal_evidence;
CREATE POLICY "anon_delete_signal_evidence"
  ON signal_evidence FOR DELETE
  TO anon, authenticated USING (true);