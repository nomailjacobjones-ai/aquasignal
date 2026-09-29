-- Seed demo sites and observations for Phase 2A prototype
-- All records marked is_demo = true
-- 4 sites, 14 observations distributed across sites
-- Includes normal, incomplete, and concern-level observations
-- Timestamps spread across 2026-09-24 to 2026-09-26

-- =========================================================
-- 1. DEMO SITES (4 sites)
-- =========================================================
INSERT INTO sites (id, name, description, city, region, country, latitude, longitude) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Riverside Site A',
   'Monitoring site near drainage pipe outlet on the eastern riverbank.',
   'Sydney', 'Eastern Catchment', 'Australia', -33.8682, 151.2086),
  ('a0000000-0000-0000-0000-000000000002', 'North Stream',
   'Upstream monitoring site in the northern hills catchment.',
   'Sydney', 'Northern Hills', 'Australia', -33.8132, 151.1520),
  ('a0000000-0000-0000-0000-000000000003', 'Greenway Creek',
   'Riparian restoration site in the western valley.',
   'Sydney', 'Western Valley', 'Australia', -33.9200, 151.0500),
  ('a0000000-0000-0000-0000-000000000004', 'Urban Wetland',
   'Constructed urban wetland receiving stormwater runoff.',
   'Sydney', 'Central Basin', 'Australia', -33.8500, 151.1200)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 2. DEMO OBSERVATIONS (14 observations)
-- =========================================================

-- Riverside Site A: 5 observations showing possible pollution pattern
INSERT INTO observations (id, site_id, submitted_at, water_appearance, odour, water_flow, visible_pollution, vegetation_condition, wildlife_observed, notes, source, is_demo) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   '2026-09-25T06:20:00Z', 'slightly_discoloured', 'faint_chemical', 'lower_than_usual',
   'oily_sheen_near_drainage_pipe', 'browning_near_banks', 'reduced_insect_activity',
   'Oily sheen visible near the drainage pipe outlet, roughly 3 metres downstream.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   '2026-09-25T16:45:00Z', 'cloudy', 'none_detected', 'lower_than_usual',
   'surface_foam', 'healthy_upstream_browning_near_outlet', 'normal_activity_upstream',
   'Foam accumulating near the outlet. Upstream looks normal.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   '2026-09-26T07:30:00Z', 'cloudy_discoloured', 'slight_chemical_smell', 'lower_than_usual',
   'surface_foam_and_oily_sheen', 'some_browning_near_banks', 'fewer_waterbirds_than_typical',
   'Foam visible near the drainage pipe outlet, roughly 3 metres downstream.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   '2026-09-26T08:15:00Z', 'murky_brown', 'musty', 'normal',
   'sediment_plume_from_north_bank', 'stable', 'two_herons_observed_upstream',
   'Sediment plume appeared to originate from the construction site north of the bank.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   '2026-09-26T09:00:00Z', 'cloudy', NULL, 'lower_than_usual',
   'surface_foam', 'some_browning_near_banks', NULL,
   NULL,
   'citizen', true)
ON CONFLICT (id) DO NOTHING;

-- North Stream: 3 observations showing turbidity after rainfall
INSERT INTO observations (id, site_id, submitted_at, water_appearance, odour, water_flow, visible_pollution, vegetation_condition, wildlife_observed, notes, source, is_demo) VALUES
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002',
   '2026-09-26T06:50:00Z', 'unusually_turbid', 'none_detected', 'higher_than_usual',
   'heavy_sediment_load', 'healthy', 'normal',
   'Turbidity increased after overnight rainfall.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002',
   '2026-09-26T09:10:00Z', 'murky', 'none_detected', 'higher_than_usual',
   'suspended_sediment', 'healthy', 'fish_visible_in_pools',
   NULL,
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002',
   '2026-09-24T10:30:00Z', 'clear', 'fresh', 'normal',
   'none_visible', 'healthy', 'normal',
   'Baseline observation before rainfall event.',
   'citizen', true)
ON CONFLICT (id) DO NOTHING;

-- Greenway Creek: 3 observations showing habitat improvement (positive trend)
INSERT INTO observations (id, site_id, submitted_at, water_appearance, odour, water_flow, visible_pollution, vegetation_condition, wildlife_observed, notes, source, is_demo) VALUES
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003',
   '2026-09-20T10:00:00Z', 'clear', 'fresh', 'normal',
   'none_visible', 'improved_new_growth_along_banks', 'increased_dragonfly_and_frog_activity',
   'Riparian restoration appears to be working. More biodiversity than last visit.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003',
   '2026-09-22T14:00:00Z', 'clear', 'none_detected', 'normal',
   'none_visible', 'healthy_and_diverse', 'abundant_birdlife',
   'Second visit this week. Water clarity excellent.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003',
   '2026-09-25T11:00:00Z', 'clear', 'fresh', 'normal',
   'none_visible', 'improved_new_growth_along_banks', 'increased_dragonfly_and_frog_activity',
   'Third observation. Improvement trend continuing.',
   'citizen', true)
ON CONFLICT (id) DO NOTHING;

-- Urban Wetland: 3 observations showing possible algal concern
INSERT INTO observations (id, site_id, submitted_at, water_appearance, odour, water_flow, visible_pollution, vegetation_condition, wildlife_observed, notes, source, is_demo) VALUES
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000004',
   '2026-09-24T07:00:00Z', 'greenish_tint', 'slight_earthy_smell', 'low',
   'possible_algal_mat_near_edges', 'overgrowth_in_channels', 'reduced_fish_visibility',
   'Greenish tint near edges. Possible algal growth.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000004',
   '2026-09-26T05:40:00Z', 'greenish_tint', 'slight_earthy_smell', 'low',
   'possible_algal_mat_near_edges', 'overgrowth_in_channels', 'reduced_fish_visibility',
   'Algal mat still visible. Condition persisting over two days.',
   'citizen', true),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000004',
   '2026-09-23T15:20:00Z', 'clear', 'none_detected', 'normal',
   'none_visible', 'healthy', 'normal',
   'Normal conditions before the algal concern developed.',
   'citizen', true)
ON CONFLICT (id) DO NOTHING;
