/*
# Create sites, observations, and observation_photos tables

## Tables
1. `sites` — freshwater monitoring locations (public reference data)
2. `observations` — citizen environmental observations linked to sites
3. `observation_photos` — photo evidence linked to observations

## Security
- No auth in this phase — all policies use `TO anon, authenticated`
- sites: read-only (public reference)
- observations: full CRUD (citizens submit observations)
- observation_photos: read + insert (photo evidence)

## Notes
- Uses gen_random_uuid() for all primary keys
- Foreign keys with ON DELETE CASCADE to keep data clean
- is_demo flag on observations to distinguish prototype data from real submissions
*/

-- =========================================================
-- 1. SITES
-- =========================================================
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  city text,
  region text,
  country text,
  latitude numeric CHECK (latitude >= -90 AND latitude <= 90),
  longitude numeric CHECK (longitude >= -180 AND longitude <= 180),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_sites" ON sites;
CREATE POLICY "anon_read_sites" ON sites FOR SELECT
  TO anon, authenticated USING (true);

-- Sites are managed by operators, not citizens — no insert/update/delete for anon
DROP POLICY IF EXISTS "anon_insert_sites" ON sites;
CREATE POLICY "anon_insert_sites" ON sites FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sites" ON sites;
CREATE POLICY "anon_update_sites" ON sites FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- 2. OBSERVATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  water_appearance text,
  odour text,
  water_flow text,
  visible_pollution text,
  vegetation_condition text,
  wildlife_observed text,
  notes text,
  source text NOT NULL DEFAULT 'citizen' CHECK (source IN ('citizen', 'sensor', 'officer', 'imported')),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_observations" ON observations;
CREATE POLICY "anon_select_observations" ON observations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_observations" ON observations;
CREATE POLICY "anon_insert_observations" ON observations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_observations" ON observations;
CREATE POLICY "anon_update_observations" ON observations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_observations" ON observations;
CREATE POLICY "anon_delete_observations" ON observations FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- 3. OBSERVATION_PHOTOS
-- =========================================================
CREATE TABLE IF NOT EXISTS observation_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE observation_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_observation_photos" ON observation_photos;
CREATE POLICY "anon_select_observation_photos" ON observation_photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_observation_photos" ON observation_photos;
CREATE POLICY "anon_insert_observation_photos" ON observation_photos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- =========================================================
-- 4. INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_observations_site_id ON observations(site_id);
CREATE INDEX IF NOT EXISTS idx_observations_submitted_at ON observations(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_source ON observations(source);
CREATE INDEX IF NOT EXISTS idx_observations_is_demo ON observations(is_demo);
CREATE INDEX IF NOT EXISTS idx_observation_photos_observation_id ON observation_photos(observation_id);
