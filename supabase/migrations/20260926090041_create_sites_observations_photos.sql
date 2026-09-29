/*
# Create core observation data foundation (Phase 2A)

## Purpose
Establish the real database foundation for citizen freshwater observations.
This migration creates three tables: `sites`, `observations`, and `observation_photos`.
It does NOT create tables for signals, AI analysis, reviews, or alerts — those belong to later phases.

## 1. New Tables

### `sites`
- `id` (uuid, primary key, auto-generated)
- `name` (text, not null) — display name of the monitoring site
- `description` (text, nullable) — optional longer description
- `city` (text, nullable) — city or locality
- `region` (text, nullable) — broader catchment or region name
- `country` (text, nullable) — country
- `latitude` (numeric, nullable) — geographic latitude
- `longitude` (numeric, nullable) — geographic longitude
- `created_at` (timestamptz, default now())

### `observations`
- `id` (uuid, primary key, auto-generated)
- `site_id` (uuid, foreign key → sites.id, on delete cascade)
- `submitted_at` (timestamptz, default now()) — when the observation was made
- `water_appearance` (text, nullable) — e.g. "clear", "cloudy", "murky_brown"
- `odour` (text, nullable) — e.g. "none", "musty", "chemical"
- `water_flow` (text, nullable) — e.g. "low", "normal", "high"
- `visible_pollution` (text, nullable) — e.g. "surface_foam", "oily_sheen", "none"
- `vegetation_condition` (text, nullable) — e.g. "healthy", "browning_banks"
- `wildlife_observed` (text, nullable) — free text description
- `notes` (text, nullable) — optional citizen notes
- `source` (text, not null, default 'citizen') — origin of observation
- `is_demo` (boolean, not null, default false) — marks prototype/demo records
- `created_at` (timestamptz, default now())

### `observation_photos`
- `id` (uuid, primary key, auto-generated)
- `observation_id` (uuid, foreign key → observations.id, on delete cascade)
- `storage_path` (text, not null) — path in the observation-evidence storage bucket
- `created_at` (timestamptz, default now())

## 2. Indexes
- `observations.site_id` — filter by site
- `observations.submitted_at` — sort by time
- `observations.source` — filter by source
- `observations.is_demo` — filter demo records
- `observation_photos.observation_id` — join photos to observations

## 3. Security (RLS)
This is a no-auth prototype. There is intentionally no user/account table.
Observations contain environmental data, not personal information.
- RLS enabled on all three tables.
- Policies use `TO anon, authenticated` so the anon-key frontend can read and write.
- `sites`: read-only for anon/authenticated (public reference data).
- `observations`: full CRUD for anon/authenticated (citizens submit observations).
- `observation_photos`: read and insert for anon/authenticated.

## 4. Constraints
- `observations.source` CHECK constraint ensures only known source values.
- Latitude/longitude range checks on `sites`.

## 5. Storage
- Storage bucket `observation-evidence` is created separately via storage migration.
- RLS policies on the bucket restrict to image files only.
*/
